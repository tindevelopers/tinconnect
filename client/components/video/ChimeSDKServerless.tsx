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

interface ChimeSDKServerlessProps {
  meeting: {
    id: string;
    title: string;
    description: string;
    host_id: string;
  };
  onLeave: () => void;
}

// Serverless API configuration
const SERVERLESS_API_BASE = 'http://localhost:8082/api'; // Using our CORS proxy

const ChimeSDKServerless: React.FC<ChimeSDKServerlessProps> = ({ meeting, onLeave }) => {
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
  const [meetingSession, setMeetingSession] = useState<any>(null);
  const [currentTileId, setCurrentTileId] = useState<number | null>(null);

  const audioVideoRef = useRef<any | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const loggerRef = useRef<ConsoleLogger | null>(null);

  const logMessage = (message: string) => {
    console.log(`[ChimeSDKServerless] ${message}`);
  };

  const checkAvailableDevices = async () => {
    try {
      logMessage('Checking available devices...');
      
      // Request permissions first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      logMessage(`Available video devices: ${videoDevices.length}`);
      logMessage(`Available audio devices: ${audioDevices.length}`);
      
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
      
      logMessage('Camera and microphone permissions granted');
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
      logMessage('Binding camera stream to video element');
      localVideoRef.current.srcObject = cameraStream;
      
      // Add event listeners for debugging
      localVideoRef.current.onloadedmetadata = () => {
        logMessage('Camera preview video metadata loaded');
      };
      localVideoRef.current.oncanplay = () => {
        logMessage('Camera preview video can play');
      };
      localVideoRef.current.onerror = (error) => {
        console.error('Camera preview video error:', error);
      };
    }
  }, [cameraStream]);

  // Effect to set up enhanced video stability monitoring when connected
  useEffect(() => {
    if (isConnected) {
      logMessage('Setting up enhanced video stability monitoring...');
      
      const videoStabilityInterval = setInterval(async () => {
        if (localVideoRef.current && isVideoEnabled) {
          // Check if video is still bound and working
          if (!localVideoRef.current.srcObject || localVideoRef.current.readyState === 0) {
            logMessage('Video appears to be disconnected, attempting to rebind...');
            
            try {
              // Approach 1: Try to restart the local video tile
              if (audioVideoRef.current && typeof audioVideoRef.current.startLocalVideoTile === 'function') {
                logMessage('Attempting to restart local video tile...');
                audioVideoRef.current.startLocalVideoTile();
                
                // Wait a bit and try to bind again
                setTimeout(() => {
                  if (localVideoRef.current) {
                    try {
                      // Try multiple tile IDs
                      const tileIds = [1, 0];
                      for (const tileId of tileIds) {
                        try {
                          audioVideoRef.current.bindVideoElement(tileId, localVideoRef.current);
                          logMessage(`Video rebinding successful with tile ID ${tileId}`);
                          setCurrentTileId(tileId);
                          return;
                        } catch (error) {
                          logMessage(`Video binding failed with tile ID ${tileId}: ${error}`);
                        }
                      }
                    } catch (error) {
                      logMessage(`Video binding failed: ${error}`);
                    }
                  }
                }, 200); // Reduced delay for faster recovery
              }
              
              // Approach 2: Fallback to camera stream
              if (cameraStream) {
                setTimeout(() => {
                  if (localVideoRef.current && !localVideoRef.current.srcObject) {
                    localVideoRef.current.srcObject = cameraStream;
                    logMessage('Video rebinding successful using camera stream');
                  }
                }, 400); // Reduced delay for faster recovery
              }
            } catch (error) {
              logMessage(`Error during video rebinding: ${error}`);
            }
          }
        }
      }, 1000); // Check every 1 second for faster detection
      
      // Clean up interval on component unmount or when disconnected
      return () => {
        clearInterval(videoStabilityInterval);
        logMessage('Video stability monitoring stopped');
      };
    }
  }, [isConnected, cameraStream, isVideoEnabled]);

  const initializeChimeMeeting = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      logMessage('Initializing Chime meeting with serverless backend...');

      // Join the meeting using the serverless API
      const joinResponse = await fetch(`${SERVERLESS_API_BASE}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: meeting.title,
          attendeeName: meeting.host_id
        }),
      });

      if (!joinResponse.ok) {
        const errorText = await joinResponse.text();
        throw new Error(`Failed to join meeting: ${joinResponse.status} - ${errorText}`);
      }

      const joinInfo = await joinResponse.json();
      logMessage('Successfully joined meeting via serverless API');

      // Create logger
      loggerRef.current = new ConsoleLogger('ChimeSDKServerless', LogLevel.INFO);

      // Create device controller
      const deviceController = new DefaultDeviceController(loggerRef.current, {
        enableWebAudio: true,
        enableUnifiedPlanForChromiumBasedBrowsers: true,
      });

      // Create meeting session configuration
      const configuration = new MeetingSessionConfiguration(
        joinInfo.JoinInfo.Meeting,
        joinInfo.JoinInfo.Attendee
      );

      // Create meeting session
      const session = new DefaultMeetingSession(
        configuration,
        loggerRef.current,
        deviceController
      );

      setMeetingSession(session);
      audioVideoRef.current = session.audioVideo;

      // Set up observers
      setupObservers();

      logMessage('Chime meeting session initialized successfully');
      return session;

    } catch (error) {
      console.error('Error initializing Chime meeting:', error);
      setConnectionError(`Failed to initialize meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
      throw error;
    }
  };

  const setupObservers = () => {
    if (!audioVideoRef.current) {
      logMessage('AudioVideo not available for observer setup');
      return;
    }

    logMessage('Setting up observers...');

    // Audio video observer
    const audioVideoObserver: AudioVideoObserver = {
      audioVideoDidStart: () => {
        logMessage('Audio video started');
        setIsConnecting(false);
        setIsConnected(true);
      },
      audioVideoDidStartConnecting: (reconnecting: boolean) => {
        logMessage(`Audio video connecting: ${reconnecting}`);
        setIsConnecting(true);
      },
      audioVideoDidStop: (sessionStatus: MeetingSessionStatus) => {
        logMessage(`Audio video stopped: ${sessionStatus.statusCode()}`);
        setIsConnected(false);
        if (sessionStatus.statusCode() === MeetingSessionStatusCode.Left) {
          onLeave();
        }
      },
      audioVideoDidFail: (sessionStatus: MeetingSessionStatus) => {
        logMessage(`Audio video failed: ${sessionStatus.statusCode()}`);
        setConnectionError('Meeting connection failed. Please try again.');
        setIsConnecting(false);
        setIsConnected(false);
      }
    };

    // Device change observer
    const deviceChangeObserver: DeviceChangeObserver = {
      audioInputsChanged: (freshAudioInputDeviceList: MediaDeviceInfo[]) => {
        logMessage(`Audio inputs changed: ${freshAudioInputDeviceList.length} devices`);
      },
      videoInputsChanged: (freshVideoInputDeviceList: MediaDeviceInfo[]) => {
        logMessage(`Video inputs changed: ${freshVideoInputDeviceList.length} devices`);
      },
      audioOutputsChanged: (freshAudioOutputDeviceList: MediaDeviceInfo[]) => {
        logMessage(`Audio outputs changed: ${freshAudioOutputDeviceList.length} devices`);
      },
      videoInputQualityChanged: (bitrateKbps: number, packetsPerSecond: number) => {
        logMessage(`Video input quality changed: ${bitrateKbps}kbps, ${packetsPerSecond}pps`);
      }
    };

    // Add observers
    audioVideoRef.current.addObserver(audioVideoObserver);
    audioVideoRef.current.addDeviceChangeObserver(deviceChangeObserver);

    // Video Tile Observer - Enhanced approach for better video stability
    try {
      // First, try the standard approach
      if (typeof audioVideoRef.current.addVideoTileObserver === 'function') {
        const videoTileObserver = {
          videoTileDidUpdate: (tileState: any) => {
            logMessage(`Video tile updated: ${tileState.tileId}, local: ${tileState.localTile}, active: ${tileState.active}`);
            if (tileState.localTile && tileState.tileId && tileState.active) {
              logMessage('Local video tile detected and active, binding to element...');
              if (localVideoRef.current) {
                try {
                  audioVideoRef.current.bindVideoElement(tileState.tileId, localVideoRef.current);
                  logMessage(`Video element bound to local tile ID: ${tileState.tileId}`);
                  
                  // Store the current tile ID for reference
                  setCurrentTileId(tileState.tileId);
                } catch (error) {
                  console.error('Error binding video element:', error);
                }
              }
            }
          },
          videoTileWasRemoved: (tileId: number) => {
            logMessage(`Video tile removed: ${tileId}`);
            // If the removed tile was our current tile, try to restart the video tile immediately
            if (tileId === currentTileId) {
              logMessage('Current video tile was removed, attempting to restart immediately...');
              setCurrentTileId(null);
              
              // Try to restart the local video tile immediately
              try {
                if (audioVideoRef.current && typeof audioVideoRef.current.startLocalVideoTile === 'function') {
                  audioVideoRef.current.startLocalVideoTile();
                  logMessage('Local video tile restarted immediately after removal');
                  
                  // Try to rebind quickly
                  setTimeout(() => {
                    if (localVideoRef.current) {
                      try {
                        audioVideoRef.current.bindVideoElement(1, localVideoRef.current);
                        logMessage('Video rebinding successful after immediate restart');
                        setCurrentTileId(1);
                      } catch (error) {
                        logMessage(`Video binding failed after immediate restart: ${error}`);
                        // Fallback to camera stream
                        if (cameraStream) {
                          localVideoRef.current.srcObject = cameraStream;
                          logMessage('Fallback to camera stream after immediate restart');
                        }
                      }
                    }
                                         }, 25); // Even shorter delay for faster recovery
                }
              } catch (error) {
                logMessage(`Failed to restart video tile immediately: ${error}`);
                // Fallback to camera stream
                if (localVideoRef.current && cameraStream) {
                  logMessage('Fallback to camera stream after immediate restart failure');
                  localVideoRef.current.srcObject = cameraStream;
                }
              }
            }
          }
        };
        
        audioVideoRef.current.addVideoTileObserver(videoTileObserver);
        logMessage('Video tile observer added successfully');
      } else {
        logMessage('Video tile observer not available, will use manual binding');
        
        // Alternative approach: Use the meeting session's video tile observer
        if (meetingSession && typeof meetingSession.audioVideo.addVideoTileObserver === 'function') {
          const videoTileObserver = {
            videoTileDidUpdate: (tileState: any) => {
              logMessage(`Video tile updated (via session): ${tileState.tileId}, local: ${tileState.localTile}`);
              if (tileState.localTile && tileState.tileId) {
                logMessage('Local video tile detected via session, binding to element...');
                if (localVideoRef.current) {
                  try {
                    meetingSession.audioVideo.bindVideoElement(tileState.tileId, localVideoRef.current);
                    logMessage(`Video element bound to local tile ID: ${tileState.tileId}`);
                    setCurrentTileId(tileState.tileId);
                  } catch (error) {
                    console.error('Error binding video element via session:', error);
                  }
                }
              }
            },
            videoTileWasRemoved: (tileId: number) => {
              logMessage(`Video tile removed (via session): ${tileId}`);
              if (tileId === currentTileId) {
                setCurrentTileId(null);
                // Try to restart the video tile
                setTimeout(() => {
                  try {
                    if (meetingSession.audioVideo && typeof meetingSession.audioVideo.startLocalVideoTile === 'function') {
                      meetingSession.audioVideo.startLocalVideoTile();
                      logMessage('Local video tile restarted via session after removal');
                    }
                  } catch (error) {
                    logMessage(`Failed to restart video tile via session: ${error}`);
                  }
                }, 500);
              }
            }
          };
          
          meetingSession.audioVideo.addVideoTileObserver(videoTileObserver);
          logMessage('Video tile observer added successfully via session');
        }
      }
    } catch (error) {
      logMessage(`Error setting up video tile observer: ${error}`);
      logMessage('Will use manual binding approach');
    }
    logMessage('Observers set up successfully');
  };

  const startMeeting = async () => {
    logMessage('=== startMeeting function called ===');
    if (!audioVideoRef.current) {
      console.error('audioVideoRef.current is null - cannot start meeting');
      return;
    }

    try {
      logMessage('Starting meeting...');

      // Check permissions before starting
      const hasPermissions = await checkAvailableDevices();
      if (!hasPermissions) {
        console.error('Permissions check failed');
        setIsConnecting(false);
        return;
      }

      // Start audio video
      logMessage('Starting audio video...');
      await audioVideoRef.current.start();
      logMessage('Audio video started successfully');

      // Start local video
      logMessage('Starting local video tile...');
      audioVideoRef.current.startLocalVideoTile();
      logMessage('Local video tile started');

      // Set video input device if selected - use the session's device controller
      if (selectedVideoDevice) {
        logMessage(`Setting video input device to: ${selectedVideoDevice}`);
        try {
          // Get the device controller from the meeting session
          const deviceController = meetingSession?.deviceController;
          if (deviceController && typeof deviceController.chooseVideoInputDevice === 'function') {
            await deviceController.chooseVideoInputDevice(selectedVideoDevice);
            logMessage('Video input device set successfully via session device controller');
          } else {
            logMessage('Device controller not available, trying alternative approach');
            // Try to set the device directly on the audioVideo facade
            if (audioVideoRef.current && typeof audioVideoRef.current.chooseVideoInputDevice === 'function') {
              await audioVideoRef.current.chooseVideoInputDevice(selectedVideoDevice);
              logMessage('Video input device set successfully via audioVideo facade');
            }
          }
        } catch (error) {
          console.error('Failed to set video input device:', error);
          logMessage(`Video device selection failed: ${error}`);
        }
      }

      // Manual video binding fallback if video tile observer is not available
      if (typeof audioVideoRef.current.addVideoTileObserver !== 'function') {
        logMessage('Using manual video binding fallback...');
        
        // Try multiple approaches for video binding
        const tryVideoBinding = async () => {
          if (localVideoRef.current) {
            try {
              // Approach 1: Try to bind to tile ID 1 (local video)
              audioVideoRef.current.bindVideoElement(1, localVideoRef.current);
              logMessage('Manual video binding successful (tile ID 1)');
              setCurrentTileId(1);
              return true;
            } catch (error) {
              logMessage(`Manual video binding failed (tile ID 1): ${error}`);
              
              try {
                // Approach 2: Try to bind to tile ID 0 (local video)
                audioVideoRef.current.bindVideoElement(0, localVideoRef.current);
                logMessage('Manual video binding successful (tile ID 0)');
                setCurrentTileId(0);
                return true;
              } catch (error2) {
                logMessage(`Manual video binding failed (tile ID 0): ${error2}`);
                
                // Approach 3: Try to get the current video tile and bind to it
                try {
                  const videoTile = audioVideoRef.current.getVideoTile(1);
                  if (videoTile && videoTile.state().localTile) {
                    audioVideoRef.current.bindVideoElement(1, localVideoRef.current);
                    logMessage('Manual video binding successful (via getVideoTile)');
                    setCurrentTileId(1);
                    return true;
                  }
                } catch (error3) {
                  logMessage(`getVideoTile approach failed: ${error3}`);
                }
                
                // Approach 4: Bind the camera stream directly as last resort
                if (cameraStream) {
                  logMessage('Binding camera stream directly to video element');
                  localVideoRef.current.srcObject = cameraStream;
                  return true;
                }
              }
            }
          }
          return false;
        };

        // Try binding after a short delay
        setTimeout(async () => {
          const success = await tryVideoBinding();
          if (!success) {
            logMessage('All video binding approaches failed');
          }
        }, 1000);

        // Also try again after a longer delay in case the tile is created later
        setTimeout(async () => {
          const success = await tryVideoBinding();
          if (!success) {
            logMessage('Video binding retry also failed');
          }
        }, 3000);
      }

      logMessage('Meeting started successfully');

    } catch (error) {
      console.error('Error starting meeting:', error);
      setConnectionError(`Failed to start meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  const startMeetingWithPreview = async () => {
    try {
      logMessage('Starting meeting with preview...');
      
      // Initialize the meeting session
      await initializeChimeMeeting();
      
      // Start the meeting
      await startMeeting();
      
      // Hide the preview
      setShowCameraPreview(false);
      
    } catch (error) {
      console.error('Error starting meeting with preview:', error);
      setConnectionError(`Failed to start meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  const toggleMute = async () => {
    if (audioVideoRef.current) {
      try {
        if (isMuted) {
          // First, ensure we have a valid audio stream
          if (!selectedAudioDevice) {
            logMessage('No audio device selected, attempting to use default...');
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const audioDevices = devices.filter(device => device.kind === 'audioinput');
              if (audioDevices.length > 0) {
                setSelectedAudioDevice(audioDevices[0].deviceId);
                logMessage(`Auto-selected audio device: ${audioDevices[0].label}`);
              }
            } catch (error) {
              logMessage(`Failed to enumerate audio devices: ${error}`);
            }
          }
          
          // Set the audio input device if we have one selected
          if (selectedAudioDevice) {
            logMessage(`Setting audio input device to: ${selectedAudioDevice}`);
            try {
              if (meetingSession?.deviceController && typeof meetingSession.deviceController.chooseAudioInputDevice === 'function') {
                await meetingSession.deviceController.chooseAudioInputDevice(selectedAudioDevice);
                logMessage('Audio input device set successfully via session device controller');
              } else if (audioVideoRef.current && typeof audioVideoRef.current.chooseAudioInputDevice === 'function') {
                await audioVideoRef.current.chooseAudioInputDevice(selectedAudioDevice);
                logMessage('Audio input device set successfully via audioVideo facade');
              }
            } catch (error) {
              console.error('Failed to set audio input device:', error);
              logMessage(`Audio device selection failed: ${error}`);
            }
          }
          
          audioVideoRef.current.realtimeSetLocalAudioMuted(false);
          setIsMuted(false);
          logMessage('Microphone unmuted');
        } else {
          audioVideoRef.current.realtimeSetLocalAudioMuted(true);
          setIsMuted(true);
          logMessage('Microphone muted');
        }
      } catch (error) {
        console.error('Error toggling microphone:', error);
        logMessage(`Microphone toggle failed: ${error}`);
      }
    }
  };

  const toggleVideo = async () => {
    if (audioVideoRef.current) {
      try {
        if (isVideoEnabled) {
          logMessage('Stopping local video tile...');
          audioVideoRef.current.stopLocalVideoTile();
          setIsVideoEnabled(false);
          setCurrentTileId(null);
          logMessage('Local video tile stopped');
        } else {
          logMessage('Starting local video tile...');
          
          // First, ensure we have a valid camera stream
          if (!cameraStream) {
            logMessage('No camera stream available, attempting to acquire...');
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined },
                audio: false 
              });
              setCameraStream(stream);
              logMessage('Camera stream acquired for toggle');
            } catch (error) {
              logMessage(`Failed to acquire camera stream: ${error}`);
              return;
            }
          }
          
          // Set the video input device first if we have one selected
          if (selectedVideoDevice) {
            logMessage(`Setting video input device to: ${selectedVideoDevice}`);
            try {
              if (meetingSession?.deviceController && typeof meetingSession.deviceController.chooseVideoInputDevice === 'function') {
                await meetingSession.deviceController.chooseVideoInputDevice(selectedVideoDevice);
                logMessage('Video input device set successfully via session device controller');
              } else if (audioVideoRef.current && typeof audioVideoRef.current.chooseVideoInputDevice === 'function') {
                await audioVideoRef.current.chooseVideoInputDevice(selectedVideoDevice);
                logMessage('Video input device set successfully via audioVideo facade');
              }
            } catch (error) {
              console.error('Failed to set video input device:', error);
              logMessage(`Video device selection failed: ${error}`);
            }
          }
          
          // Start the local video tile
          audioVideoRef.current.startLocalVideoTile();
          setIsVideoEnabled(true);
          logMessage('Local video tile started');
          
          // Try to bind video after a short delay
          setTimeout(() => {
            if (localVideoRef.current) {
              try {
                audioVideoRef.current.bindVideoElement(1, localVideoRef.current);
                logMessage('Video binding successful after toggle');
                setCurrentTileId(1);
              } catch (error) {
                logMessage(`Video binding failed after toggle: ${error}`);
                // Fallback to camera stream
                if (cameraStream) {
                  localVideoRef.current.srcObject = cameraStream;
                  logMessage('Fallback to camera stream after toggle');
                }
              }
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error toggling video:', error);
        logMessage(`Video toggle failed: ${error}`);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (audioVideoRef.current) {
      if (isScreenSharing) {
        await audioVideoRef.current.stopContentShare();
        setIsScreenSharing(false);
      } else {
        try {
          await audioVideoRef.current.startContentShare();
          setIsScreenSharing(true);
        } catch (error) {
          console.error('Error starting screen share:', error);
        }
      }
    }
  };

  const leaveMeeting = async () => {
    try {
      logMessage('Leaving meeting...');
      
      if (audioVideoRef.current) {
        await audioVideoRef.current.stop();
      }

      // End the meeting via serverless API
      if (meetingSession) {
        await fetch(`${SERVERLESS_API_BASE}/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: meeting.title
          }),
        });
      }

      onLeave();
    } catch (error) {
      console.error('Error leaving meeting:', error);
      onLeave();
    }
  };

  // Initialize camera preview on mount
  useEffect(() => {
    startCameraPreview();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioVideoRef.current) {
        audioVideoRef.current.stop();
      }
    };
  }, []);

  if (showCameraPreview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8">Camera Preview</h1>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Meeting: {meeting.title}</h2>
            <p className="text-gray-300 mb-6">{meeting.description}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Camera Preview</h3>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 bg-black rounded-lg"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Device Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Camera</label>
                    <select
                      value={selectedVideoDevice}
                      onChange={(e) => setSelectedVideoDevice(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      {availableDevices.videoDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Microphone</label>
                    <select
                      value={selectedAudioDevice}
                      onChange={(e) => setSelectedAudioDevice(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      {availableDevices.audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={startMeetingWithPreview}
                disabled={isConnecting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                {isConnecting ? 'Connecting...' : 'Start Meeting'}
              </button>
              
              <button
                onClick={onLeave}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
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
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{meeting.title}</h1>
          <p className="text-gray-300 text-sm">{meeting.description}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {connectionError && (
            <div className="text-red-400 text-sm">{connectionError}</div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg ${isMuted ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-lg ${!isVideoEnabled ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}
              title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoEnabled ? '📹' : '🚫'}
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`p-2 rounded-lg ${isScreenSharing ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'}`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              {isScreenSharing ? '🖥️' : '📺'}
            </button>
            
            <button
              onClick={leaveMeeting}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
              title="Leave meeting"
            >
              ❌
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Local Video */}
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              You (Local)
            </div>
          </div>
          
          {/* Remote Video */}
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              Remote Participants
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 p-2 text-center text-sm">
        {isConnecting && <span className="text-yellow-400">Connecting...</span>}
        {isConnected && <span className="text-green-400">Connected</span>}
        {connectionError && <span className="text-red-400">Error: {connectionError}</span>}
      </div>
    </div>
  );
};

export default ChimeSDKServerless;
