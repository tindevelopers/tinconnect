import React, { useEffect, useRef, useState } from 'react';
import {
  AudioVideoObserver,
  DeviceChangeObserver,
  VideoTileObserver,
  VideoTileState,
  MeetingSessionConfiguration,
  DefaultDeviceController,
  LogLevel,
  ConsoleLogger,
  MeetingSessionStatus,
  MeetingSessionStatusCode,
} from 'amazon-chime-sdk-js';

interface ChimeSDKMeetingProps {
  meeting: {
    id: string;
    title: string;
    description: string;
    host_id: string;
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

  const audioVideoRef = useRef<any | null>(null); // Changed type to any as AudioVideoFacade is not imported
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const loggerRef = useRef<ConsoleLogger | null>(null);

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
      
      console.log('Camera and microphone permissions granted');
      return true;
    } catch (error) {
      console.error('Error checking devices:', error);
      setConnectionError('Camera and microphone access is required. Please allow permissions and try again.');
      return false;
    }
  };

  const initializeMeetingSession = async (meetingConfig: any) => {
    try {
      console.log('Initializing meeting session with config:', meetingConfig);

      // Create logger
      loggerRef.current = new ConsoleLogger('ChimeSDKMeeting', LogLevel.INFO);

      // Create device controller
      const deviceController = new DefaultDeviceController(loggerRef.current, {
        enableWebAudio: true,
        enableUnifiedPlanForChromiumBasedBrowsers: true,
      });

      // Create meeting session configuration
      const configuration = new MeetingSessionConfiguration(
        meetingConfig.meeting,
        meetingConfig.attendee,
        deviceController
      );

      // Create meeting session
      const meetingSession = new DefaultMeetingSession(
        configuration,
        loggerRef.current,
        deviceController
      );

      // Store the audio video facade
      audioVideoRef.current = meetingSession.audioVideo;

      // Set up observers
      setupObservers();

      // Start the meeting
      await startMeeting();

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
      videoInputQualityChanged: (bitrateKbps: number, packetsPerSecond: number) => {
        console.log('Video input quality changed:', { bitrateKbps, packetsPerSecond });
      }
    };

    // Video tile observer to handle video tile updates
    const videoTileObserver: VideoTileObserver = {
      videoTileDidUpdate: (tileState: VideoTileState) => {
        console.log('Video tile updated:', tileState);
        if (tileState.localTile && tileState.active) {
          console.log('Local video tile is active, binding video element');
          if (localVideoRef.current) {
            audioVideoRef.current?.bindVideoElement(tileState.tileId, localVideoRef.current);
          }
        }
      },
      videoTileWasRemoved: (tileId: number) => {
        console.log('Video tile removed:', tileId);
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

      // Check permissions before starting
      const hasPermissions = await checkAvailableDevices();
      if (!hasPermissions) {
        setIsConnecting(false);
        return;
      }

      // Start audio video
      await audioVideoRef.current.start();

      // Start local video
      audioVideoRef.current.startLocalVideoTile();
      console.log('Local video started successfully');

      console.log('Meeting started successfully');

    } catch (error) {
      console.error('Error starting meeting:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setConnectionError('Camera and microphone access was denied. Please allow permissions in your browser settings and try again.');
        } else if (error.name === 'NotFoundError') {
          setConnectionError('No camera or microphone found. Please connect a device and try again.');
        } else if (error.name === 'NotReadableError') {
          setConnectionError('Camera or microphone is already in use by another application. Please close other apps and try again.');
        } else {
          setConnectionError(`Failed to start meeting: ${error.message}`);
        }
      } else {
        setConnectionError('Failed to start meeting. Please check your camera and microphone permissions.');
      }
      
      setIsConnecting(false);
    }
  };

  const initializeChimeMeeting = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Check for available devices first
      await checkAvailableDevices();

      // Get the meeting configuration from the server
      const response = await fetch(`/api/meetings/${meeting.id}/chime-config?userId=${meeting.host_id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get meeting configuration: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get meeting configuration');
      }

      const meetingConfig = result.data;
      console.log('Meeting config received:', meetingConfig);

      // Initialize the meeting session
      await initializeMeetingSession(meetingConfig);

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
      audioVideoRef.current.stopLocalVideoTile();
      setIsVideoEnabled(false);
    } else {
      audioVideoRef.current.startLocalVideoTile();
      // Bind the local video element to tile ID 0 (local video)
      if (localVideoRef.current) {
        audioVideoRef.current.bindVideoElement(0, localVideoRef.current);
      }
      setIsVideoEnabled(true);
    }
  };

  const toggleScreenShare = async () => {
    if (!audioVideoRef.current) return;

    try {
      if (isScreenSharing) {
        await audioVideoRef.current.stopContentShare();
        setIsScreenSharing(false);
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        await audioVideoRef.current.startContentShare(stream);
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
  }, [meeting.id]);

  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Connection Error</h2>
          <p className="text-red-200 mb-4">{connectionError}</p>
          <button
            onClick={async () => {
              setConnectionError(null);
              setIsConnecting(true);
              
              try {
                // First check permissions
                const hasPermissions = await checkAvailableDevices();
                if (!hasPermissions) {
                  setIsConnecting(false);
                  return;
                }
                
                // Then initialize the meeting
                await initializeChimeMeeting();
              } catch (error) {
                console.error('Error in retry:', error);
                setConnectionError('Failed to retry. Please check your browser permissions and try again.');
                setIsConnecting(false);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-xl font-bold">{meeting.title}</h1>
        <button
          onClick={leaveMeeting}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Leave Meeting
        </button>
      </div>

      {/* Loading State */}
      {isConnecting && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connecting to meeting...</p>
          </div>
        </div>
      )}

      {/* Meeting Interface */}
      {!isConnecting && (
        <div className="flex-1 flex">
          {/* Video Area */}
          <div className="flex-1 flex flex-wrap gap-4 p-4">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden flex-1 min-h-64">
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
            <div className="relative bg-gray-800 rounded-lg overflow-hidden flex-1 min-h-64">
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

          {/* Controls */}
          <div className="w-16 bg-gray-800 border-l border-gray-700 flex flex-col items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isMuted ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>

            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                !isVideoEnabled ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {!isVideoEnabled ? '📹' : '📷'}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isScreenSharing ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              🖥️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChimeSDKMeeting;
