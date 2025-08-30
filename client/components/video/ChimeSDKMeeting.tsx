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
    chime_meeting_id: string;
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

  // Refs
  const meetingSessionRef = useRef<DefaultMeetingSession | null>(null);
  const audioVideoRef = useRef<AudioVideoFacade | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const loggerRef = useRef<ConsoleLogger | null>(null);

  // Initialize meeting session
  const initializeMeetingSession = async (configuration: MeetingSessionConfiguration) => {
    try {
      console.log('Initializing meeting session with configuration:', configuration);
      
      // Create logger
      loggerRef.current = new ConsoleLogger('ChimeSDKMeeting', LogLevel.INFO);
      
      // Create device controller
      const deviceController = new DefaultDeviceController(loggerRef.current, {
        enableWebAudio: true,
        enableUnifiedPlanForChromiumBasedBrowsers: true,
      });

      // Create meeting session
      meetingSessionRef.current = new DefaultMeetingSession(
        configuration,
        loggerRef.current,
        deviceController
      );

      audioVideoRef.current = meetingSessionRef.current.audioVideo;

      // Set up observers
      setupObservers();

      console.log('Meeting session initialized successfully');
    } catch (error) {
      console.error('Error initializing meeting session:', error);
      throw error;
    }
  };

  // Set up observers
  const setupObservers = () => {
    if (!audioVideoRef.current) return;

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
        setIsConnecting(false);
        
        if (sessionStatus.statusCode() === MeetingSessionStatusCode.Left) {
          onLeave();
        }
      },
      audioVideoDidFail: (sessionStatus: MeetingSessionStatus) => {
        console.log('Audio video failed:', sessionStatus);
        setConnectionError('Meeting connection failed. Please try again.');
        setIsConnecting(false);
        setIsConnected(false);
      },
      audioVideoDidReconnect: () => {
        console.log('Audio video reconnected');
        setIsConnected(true);
        setIsConnecting(false);
      },
    };

    // Video tile observer
    const videoTileObserver: VideoTileObserver = {
      videoTileDidUpdate: (tileState: VideoTileState) => {
        console.log('Video tile updated:', tileState);
        if (tileState.localTile) {
          if (localVideoRef.current && tileState.active) {
            audioVideoRef.current?.bindVideoElement(tileState.tileId, localVideoRef.current);
          }
        } else {
          if (remoteVideoRef.current && tileState.active) {
            audioVideoRef.current?.bindVideoElement(tileState.tileId, remoteVideoRef.current);
          }
        }
      },
      videoTileWasRemoved: (tileId: number) => {
        console.log('Video tile removed:', tileId);
      },
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
      deviceLabelTrigger: (device: Device, label: string) => {
        console.log('Device label trigger:', device, label);
      },
    };

    // Add observers
    audioVideoRef.current.addObserver(audioVideoObserver);
    audioVideoRef.current.addVideoTileObserver(videoTileObserver);
    audioVideoRef.current.addDeviceChangeObserver(deviceChangeObserver);
  };

  // Check available devices
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
      
      console.log('Device check completed successfully');
    } catch (error) {
      console.error('Device check failed:', error);
      throw error;
    }
  };

  // Initialize Chime meeting
  const initializeChimeMeeting = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Check for available devices first
      await checkAvailableDevices();

      // Fetch meeting configuration from server
      console.log('Fetching meeting configuration for:', meeting.id);
      const response = await fetch(`/api/meetings/${meeting.id}/chime-config`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meeting configuration');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get meeting configuration');
      }

      const chimeConfig = result.data;
      console.log('Chime configuration received:', chimeConfig);

      // Create meeting session configuration
      const configuration = new MeetingSessionConfiguration(
        chimeConfig.meeting,
        chimeConfig.attendee || {
          AttendeeId: 'temp-attendee-id',
          ExternalUserId: 'temp-external-user-id',
          JoinToken: 'temp-join-token'
        }
      );

      // Initialize meeting session
      await initializeMeetingSession(configuration);

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

  // Start meeting
  const startMeeting = async () => {
    if (!audioVideoRef.current) return;

    try {
      console.log('Starting meeting...');
      
      // Start audio video
      await audioVideoRef.current.start();
      
      console.log('Meeting started successfully');
    } catch (error) {
      console.error('Error starting meeting:', error);
      setConnectionError('Failed to start meeting. Please check your camera and microphone permissions.');
      setIsConnecting(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioVideoRef.current) return;

    try {
      if (isMuted) {
        audioVideoRef.current.realtimeUnmuteLocalAudio();
        setIsMuted(false);
      } else {
        audioVideoRef.current.realtimeMuteLocalAudio();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (!audioVideoRef.current) return;

    try {
      if (isVideoEnabled) {
        audioVideoRef.current.stopLocalVideo();
        setIsVideoEnabled(false);
      } else {
        audioVideoRef.current.startLocalVideo();
        setIsVideoEnabled(true);
      }
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (!audioVideoRef.current) return;

    try {
      if (isScreenSharing) {
        await audioVideoRef.current.stopContentShare();
        setIsScreenSharing(false);
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        await audioVideoRef.current.startContentShare(stream);
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  // Leave meeting
  const leaveMeeting = () => {
    if (audioVideoRef.current) {
      audioVideoRef.current.stop();
    }
    onLeave();
  };

  // Initialize on mount
  useEffect(() => {
    initializeChimeMeeting();

    // Cleanup on unmount
    return () => {
      if (audioVideoRef.current) {
        audioVideoRef.current.stop();
      }
    };
  }, [meeting.id]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <h2 className="text-xl font-semibold">{meeting.title}</h2>
        <button
          onClick={leaveMeeting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
        >
          <span>Leave Meeting</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                You (Local)
              </div>
            </div>

            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                Remote Participant
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="lg:w-80 p-4 bg-gray-800">
          <div className="space-y-4">
            {/* Status */}
            <div className="text-center">
              {isConnecting && (
                <div className="text-yellow-400">Connecting...</div>
              )}
              {isConnected && (
                <div className="text-green-400">Connected</div>
              )}
              {connectionError && (
                <div className="text-red-400">{connectionError}</div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={toggleMute}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                onClick={toggleVideo}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  !isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>{isVideoEnabled ? 'Stop Video' : 'Start Video'}</span>
              </button>

              <button
                onClick={toggleScreenShare}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isScreenSharing ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
              </button>
            </div>

            {/* Participants */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Participants</h3>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{participant.name || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChimeSDKMeeting;
