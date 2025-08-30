import React, { useEffect, useRef, useState } from 'react';
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  MeetingSessionCredentials,
  MeetingSessionStatus,
  MeetingSessionStatusCode,
  AudioVideoFacade,
  AudioVideoObserver,
  DeviceChangeObserver,
  VideoTileObserver,
  AudioInputDevice,
  VideoInputDevice,
  Device,
  VideoTile,
  VideoTileState,
  AudioVideoState,
  MeetingSessionLifecycleEvent,
  MeetingSessionLifecycleEventCondition,
  MeetingSessionLifecycleEventConditionType,
  MeetingSessionLifecycleEventType,
  MeetingSessionLifecycleEventConditionType as LifecycleEventConditionType,
} from 'amazon-chime-sdk-js';

interface ChimeSDKMeetingProps {
  meeting: {
    id: string;
    title: string;
    description?: string;
    chime_meeting_id?: string;
    host_id: string;
    tenant_id: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  onLeave: () => void;
}

const ChimeSDKMeeting: React.FC<ChimeSDKMeetingProps> = ({ meeting, onLeave }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  const audioVideoRef = useRef<AudioVideoFacade | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const loggerRef = useRef<ConsoleLogger | null>(null);
  const deviceControllerRef = useRef<DefaultDeviceController | null>(null);

  // Check for available devices first
  const checkAvailableDevices = async () => {
    try {
      console.log('Checking available devices...');
      
      // Request permissions first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      // Enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      console.log('Available video devices:', videoDevices.length);
      console.log('Available audio devices:', audioDevices.length);
      
      if (videoDevices.length === 0) {
        throw new Error('No camera found. Please connect a camera and try again.');
      }
      
      if (audioDevices.length === 0) {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }
      
      console.log('Device check passed');
    } catch (error) {
      console.error('Device check failed:', error);
      if (error instanceof Error) {
        throw new Error(`Device access failed: ${error.message}`);
      }
      throw new Error('Failed to access camera and microphone. Please check permissions.');
    }
  };

  const initializeMeetingSession = async () => {
    try {
      console.log('Initializing meeting session...');

      // Get the meeting configuration from the server
      const response = await fetch(`/api/meetings/${meeting.id}/chime-config`);
      if (!response.ok) {
        throw new Error('Failed to get meeting configuration');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to get meeting configuration');
      }

      const config = result.data;
      console.log('Meeting configuration:', config);

      // Create meeting session configuration
      const meetingSessionConfiguration = new MeetingSessionConfiguration(
        config.meeting,
        config.attendee
      );

      // Create device controller
      deviceControllerRef.current = new DefaultDeviceController(loggerRef.current!, {
        enableWebAudio: true,
        enableUnifiedPlanForChromiumBasedBrowsers: true,
      });

      // Create meeting session
      const meetingSession = new DefaultMeetingSession(
        meetingSessionConfiguration,
        loggerRef.current!,
        deviceControllerRef.current
      );

      audioVideoRef.current = meetingSession.audioVideo;

      // Set up observers
      setupObservers();

      console.log('Meeting session initialized successfully');
      return meetingSession;

    } catch (error) {
      console.error('Error initializing meeting session:', error);
      throw error;
    }
  };

  const setupObservers = () => {
    if (!audioVideoRef.current) return;

    console.log('Setting up observers...');

    // Audio video observer
    const audioVideoObserver: AudioVideoObserver = {
      audioVideoDidStart: () => {
        console.log('Audio video started');
        setIsConnecting(false);
        setIsConnected(true);
      },
      audioVideoDidStartConnecting: (reconnecting: boolean) => {
        console.log('Audio video connecting:', reconnecting);
        setIsConnecting(true);
      },
      audioVideoDidStop: (sessionStatus: MeetingSessionStatus) => {
        console.log('Audio video stopped:', sessionStatus);
        setIsConnected(false);
        if (sessionStatus.statusCode() === MeetingSessionStatusCode.Left) {
          onLeave();
        }
      },
      audioVideoDidFail: (sessionStatus: MeetingSessionStatus) => {
        console.log('Audio video failed:', sessionStatus);
        setConnectionError('Meeting connection failed. Please try again.');
        setIsConnecting(false);
        setIsConnected(false);
      }
    };

    // Video tile observer
    const videoTileObserver: VideoTileObserver = {
      videoTileDidUpdate: (tileState: VideoTileState) => {
        console.log('Video tile updated:', tileState);
        if (tileState.localTile) {
          // Local video
          if (localVideoRef.current && tileState.active) {
            audioVideoRef.current?.bindVideoElement(tileState.tileId, localVideoRef.current);
          }
        } else {
          // Remote video
          if (remoteVideoRef.current && tileState.active) {
            audioVideoRef.current?.bindVideoElement(tileState.tileId, remoteVideoRef.current);
          }
        }
      },
      videoTileWasRemoved: (tileId: number) => {
        console.log('Video tile removed:', tileId);
      }
    };

    // Device change observer
    const deviceChangeObserver: DeviceChangeObserver = {
      audioInputsChanged: (freshAudioInputDeviceList: MediaDeviceInfo[]) => {
        console.log('Audio inputs changed:', freshAudioInputDeviceList);
      },
      videoInputsChanged: (freshVideoInputDeviceList: MediaDeviceInfo[]) => {
        console.log('Video inputs changed:', freshVideoInputDeviceList);
      },
      audioOutputsChanged: (freshAudioOutputDeviceList: MediaDeviceInfo[]) => {
        console.log('Audio outputs changed:', freshAudioOutputDeviceList);
      },
      videoInputsChanged: (freshVideoInputDeviceList: MediaDeviceInfo[]) => {
        console.log('Video inputs changed:', freshVideoInputDeviceList);
      }
    };

    // Add observers
    audioVideoRef.current.addObserver(audioVideoObserver);
    audioVideoRef.current.addVideoTileObserver(videoTileObserver);
    audioVideoRef.current.addDeviceChangeObserver(deviceChangeObserver);

    console.log('Observers set up successfully');
  };

  const startMeeting = async () => {
    if (!audioVideoRef.current) return;

    try {
      console.log('Starting meeting...');

      // Start audio video
      await audioVideoRef.current.start();

      // Start local video
      audioVideoRef.current.startLocalVideo();

      console.log('Meeting started successfully');

    } catch (error) {
      console.error('Error starting meeting:', error);
      setConnectionError('Failed to start meeting. Please check your camera and microphone permissions.');
      setIsConnecting(false);
    }
  };

  const initializeChimeMeeting = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Check for available devices first
      await checkAvailableDevices();

      // Create logger
      loggerRef.current = new ConsoleLogger('ChimeSDKMeeting', LogLevel.INFO);

      // Initialize meeting session
      await initializeMeetingSession();

      // Start the meeting
      await startMeeting();

    } catch (error) {
      console.error('Error initializing Chime meeting:', error);
      if (error instanceof Error) {
        setConnectionError(error.message);
      } else {
        setConnectionError('Failed to initialize meeting. Please try again.');
      }
      setIsConnecting(false);
    }
  };

  const toggleMute = () => {
    if (!audioVideoRef.current) return;

    if (isMuted) {
      audioVideoRef.current.realtimeUnmuteLocalAudio();
      setIsMuted(false);
    } else {
      audioVideoRef.current.realtimeMuteLocalAudio();
      setIsMuted(true);
    }
  };

  const toggleVideo = () => {
    if (!audioVideoRef.current) return;

    if (isVideoEnabled) {
      audioVideoRef.current.stopLocalVideo();
      setIsVideoEnabled(false);
    } else {
      audioVideoRef.current.startLocalVideo();
      setIsVideoEnabled(true);
    }
  };

  const toggleScreenShare = async () => {
    if (!audioVideoRef.current) return;

    try {
      if (isScreenSharing) {
        audioVideoRef.current.stopContentShare();
        setIsScreenSharing(false);
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        audioVideoRef.current.startContentShare(stream);
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const leaveMeeting = () => {
    if (audioVideoRef.current) {
      audioVideoRef.current.stop();
    }
    onLeave();
  };

  useEffect(() => {
    initializeChimeMeeting();

    return () => {
      if (audioVideoRef.current) {
        audioVideoRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <h1 className="text-xl font-semibold">{meeting.title}</h1>
        <button
          onClick={leaveMeeting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Leave Meeting
        </button>
      </div>

      {/* Video Container */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              You (Local)
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              Remote Participant
            </div>
          </div>
        </div>

        {/* Error Message */}
        {connectionError && (
          <div className="mt-4 p-4 bg-red-600 rounded-lg">
            {connectionError}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={toggleMute}
            className={`px-6 py-3 rounded-lg transition-colors ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>

          <button
            onClick={toggleVideo}
            className={`px-6 py-3 rounded-lg transition-colors ${
              !isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isVideoEnabled ? 'Stop Video' : 'Start Video'}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`px-6 py-3 rounded-lg transition-colors ${
              isScreenSharing ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </button>
        </div>

        {/* Participants */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Participants</h3>
          <div className="space-y-2">
            {participants.map((participant, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{participant.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChimeSDKMeeting;
