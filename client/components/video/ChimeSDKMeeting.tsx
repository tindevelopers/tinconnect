import React, { useEffect, useRef, useState } from 'react';
import {
  AudioVideoObserver,
  DeviceChangeObserver,
  VideoTileState,
  MeetingSessionConfiguration,
  DefaultDeviceController,
  DefaultMeetingSession,
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
  const [showCameraPreview, setShowCameraPreview] = useState(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [availableDevices, setAvailableDevices] = useState<{
    videoDevices: MediaDeviceInfo[];
    audioDevices: MediaDeviceInfo[];
  }>({ videoDevices: [], audioDevices: [] });
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
      
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      console.log('Available video devices:', videoDevices);
      console.log('Available audio devices:', audioDevices);
      
      // Set available devices
      setAvailableDevices({ videoDevices, audioDevices });
      
      // Set default selections
      if (videoDevices.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoDevices[0].deviceId);
      }
      if (audioDevices.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioDevices[0].deviceId);
      }
      
      // Store the stream for preview
      setCameraStream(stream);
      
      console.log('Camera and microphone permissions granted');
      return true;
    } catch (error) {
      console.error('Error checking devices:', error);
      setConnectionError('Camera and microphone access is required. Please allow permissions and try again.');
      return false;
    }
  };

  const startCameraPreview = async () => {
    try {
      await checkAvailableDevices();
    } catch (error) {
      console.error('Error starting camera preview:', error);
    }
  };

  // Effect to bind video element when camera stream is available
  useEffect(() => {
    if (cameraStream && localVideoRef.current) {
      console.log('Binding camera stream to video element');
      localVideoRef.current.srcObject = cameraStream;
    } else if (cameraStream && !localVideoRef.current) {
      // Retry mechanism if video element isn't ready yet
      console.log('Video element not ready, retrying in 100ms');
      const timer = setTimeout(() => {
        if (localVideoRef.current) {
          console.log('Binding camera stream to video element (retry)');
          localVideoRef.current.srcObject = cameraStream;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [cameraStream]);

  const startMeetingWithPreview = async () => {
    setShowCameraPreview(false);
    setIsConnecting(true);
    
    // Stop the preview stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    // Wait a moment for the UI to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize the meeting
    await initializeChimeMeeting();
  };

  const initializeMeetingSession = async (meetingConfig: any) => {
    try {
      console.log('=== initializeMeetingSession function called ===');
      console.log('Initializing meeting session with config:', meetingConfig);

      // Create logger
      console.log('Creating logger...');
      loggerRef.current = new ConsoleLogger('ChimeSDKMeeting', LogLevel.INFO);
      console.log('Logger created successfully');

      // Create device controller
      console.log('Creating device controller...');
      const deviceController = new DefaultDeviceController(loggerRef.current, {
        enableWebAudio: true,
        enableUnifiedPlanForChromiumBasedBrowsers: true,
      });
      console.log('Device controller created successfully');

      // Create meeting session configuration
      console.log('Creating meeting session configuration...');
      const configuration = new MeetingSessionConfiguration(
        meetingConfig.meeting,
        meetingConfig.attendee,
        deviceController
      );
      console.log('Meeting session configuration created successfully');

      // Create meeting session
      console.log('Creating meeting session...');
      const meetingSession = new DefaultMeetingSession(
        configuration,
        loggerRef.current,
        deviceController
      );
      console.log('Meeting session created successfully');

      // Store the audio video facade
      console.log('Storing audio video facade...');
      audioVideoRef.current = meetingSession.audioVideo;
      console.log('Audio video facade stored successfully');

      // Set up observers
      console.log('Setting up observers...');
      setupObservers();

      // Start the meeting
      console.log('Starting the meeting...');
      await startMeeting();
      console.log('Meeting start initiated successfully');

    } catch (error) {
      console.error('Error initializing meeting session:', error);
      throw error;
    }
  };

  const setupObservers = () => {
    console.log('=== setupObservers function called ===');
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

    // Add observers - only use available methods
    console.log('Adding audio video observer...');
    audioVideoRef.current.addObserver(audioVideoObserver);
    console.log('Adding device change observer...');
    audioVideoRef.current.addDeviceChangeObserver(deviceChangeObserver);

    // Note: Video tile observer is not available in this version
    // We'll handle video tiles manually in the startMeeting function

    console.log('Observers set up successfully');
  };

  const startMeeting = async () => {
    console.log('=== startMeeting function called ===');
    if (!audioVideoRef.current) {
      console.error('audioVideoRef.current is null - cannot start meeting');
      return;
    }

    try {
      console.log('Starting meeting...');

      // Check permissions before starting
      console.log('Checking permissions...');
      const hasPermissions = await checkAvailableDevices();
      console.log('Permissions check result:', hasPermissions);
      if (!hasPermissions) {
        console.error('Permissions check failed');
        setIsConnecting(false);
        return;
      }

      // Start audio video
      console.log('Starting audio video...');
      await audioVideoRef.current.start();
      console.log('Audio video started successfully');

      // Start local video
      console.log('Starting local video tile...');
      audioVideoRef.current.startLocalVideoTile();
      console.log('Local video started successfully');

      // Manually bind video element since video tile observer is not available
      // Add a retry mechanism since the video element might not be rendered yet
      let retryCount = 0;
      const maxRetries = 20; // Increased retries
      const bindVideoElement = () => {
        if (localVideoRef.current) {
          console.log('localVideoRef.current is available, binding video element...');
          // Get the local video tile ID (usually 1 for local video)
          const localTileId = 1;
          try {
            audioVideoRef.current.bindVideoElement(localTileId, localVideoRef.current);
            console.log('Video element bound manually to tile ID:', localTileId);
            return true;
          } catch (error) {
            console.error('Error binding video element:', error);
            return false;
          }
        } else {
          console.log(`localVideoRef.current is null - retry ${retryCount + 1}/${maxRetries}`);
          retryCount++;
          if (retryCount < maxRetries) {
            // Retry after a longer delay
            setTimeout(bindVideoElement, 200);
            return false;
          } else {
            console.error('Failed to bind video element after maximum retries');
            return false;
          }
        }
      };
      
      bindVideoElement();

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
    // Start camera preview when component mounts
    startCameraPreview();

    return () => {
      if (audioVideoRef.current) {
        audioVideoRef.current.stop();
      }
      // Stop camera stream on cleanup
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  // Camera Preview Screen
  if (showCameraPreview) {
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
          <h1 className="text-xl font-bold">Camera Setup - {meeting.title}</h1>
          <button
            onClick={leaveMeeting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">Camera & Microphone Setup</h2>
            
            {/* Camera Preview */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Camera Preview</h3>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
                {cameraStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => console.log('Video metadata loaded')}
                    onCanPlay={() => console.log('Video can play')}
                    onError={(e) => console.error('Video error:', e)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📹</div>
                      <p>Camera not started</p>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={startCameraPreview}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {cameraStream ? 'Restart Camera' : 'Start Camera'}
              </button>
            </div>

            {/* Device Selection */}
            {availableDevices.videoDevices.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Device Selection</h3>
                
                {/* Video Device */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Camera</label>
                  <select
                    value={selectedVideoDevice}
                    onChange={(e) => setSelectedVideoDevice(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    {availableDevices.videoDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audio Device */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Microphone</label>
                  <select
                    value={selectedAudioDevice}
                    onChange={(e) => setSelectedAudioDevice(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    {availableDevices.audioDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Start Meeting Button */}
            <div className="text-center">
              <button
                onClick={startMeetingWithPreview}
                disabled={!cameraStream}
                className={`px-8 py-3 rounded-lg font-semibold ${
                  cameraStream
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {cameraStream ? '✅ Start Meeting' : 'Start Camera First'}
              </button>
            </div>
          </div>
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
                onLoadedMetadata={() => console.log('Meeting video metadata loaded')}
                onCanPlay={() => console.log('Meeting video can play')}
                onError={(e) => console.error('Meeting video error:', e)}
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
