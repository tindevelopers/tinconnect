import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  RealtimeSubscribeToAttendeeIdPresenceCallback,
  RealtimeSubscribeToVolumeIndicatorCallback,
  RealtimeSubscribeToLocalAudioMutedCallback,
  RealtimeSubscribeToLocalVideoMutedCallback,
} from 'amazon-chime-sdk-js';
import { useParticipants, ParticipantProvider } from '../../contexts/ParticipantContext';
import { Participant } from '../meetings/ParticipantList';

interface ChimeSDKServerlessEnhancedProps {
  meeting: {
    id: string;
    title: string;
    description: string;
    host_id: string;
  };
  onLeave: () => void;
  currentUserId: string;
}

// Serverless API configuration
const SERVERLESS_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://wlid311tl7.execute-api.us-east-1.amazonaws.com/Prod'
  : 'http://localhost:8082/api';

const ChimeSDKServerlessEnhanced: React.FC<ChimeSDKServerlessEnhancedProps> = ({ 
  meeting, 
  onLeave, 
  currentUserId 
}) => {
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
  const [meetingSession, setMeetingSession] = useState<any>(null);
  const [currentTileId, setCurrentTileId] = useState<number | null>(null);

  const audioVideoRef = useRef<any | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const loggerRef = useRef<ConsoleLogger | null>(null);

  // Participant context hooks
  const {
    participants,
    addParticipant,
    removeParticipant,
    updateParticipant,
    muteParticipant,
    unmuteParticipant,
    removeParticipantFromMeeting,
    promoteToCoHost,
    demoteFromCoHost,
    muteAllParticipants,
    muteAllExceptHost,
    isHost,
    isCoHost,
  } = useParticipants();

  const logMessage = (message: string) => {
    console.log(`[ChimeSDKServerlessEnhanced] ${message}`);
  };

  // Initialize Chime SDK event listeners
  const setupChimeEventListeners = useCallback((audioVideo: any) => {
    if (!audioVideo) return;

    logMessage('Setting up Chime SDK event listeners...');

    // Subscribe to attendee presence changes
    const handleAttendeePresence: RealtimeSubscribeToAttendeeIdPresenceCallback = (attendeeId: string, present: boolean) => {
      logMessage(`Attendee ${attendeeId} ${present ? 'joined' : 'left'} the meeting`);
      
      if (present) {
        // New attendee joined
        const newParticipant: Participant = {
          attendeeId,
          externalUserId: attendeeId, // This should come from Chime SDK external user ID
          name: `Participant ${attendeeId.slice(-4)}`, // Temporary name, should be resolved from external user ID
          role: 'participant',
          status: 'connected',
          audio: 'unmuted',
          video: 'on',
          isLocal: false,
          joinTime: new Date(),
          connectionQuality: 'excellent',
          permissions: {
            canMuteOthers: false,
            canRemoveOthers: false,
            canPromoteToHost: false,
            canRecord: false,
            canShareScreen: true,
          },
        };
        addParticipant(newParticipant);
      } else {
        // Attendee left
        removeParticipant(attendeeId);
      }
    };

    // Subscribe to volume indicator changes for speaking detection
    const handleVolumeIndicator: RealtimeSubscribeToVolumeIndicatorCallback = (attendeeId: string, level: number, muted: boolean, signalStrength: number) => {
      if (level > 0.1 && !muted) { // Threshold for speaking
        updateParticipant(attendeeId, { audio: 'speaking' });
      } else {
        const participant = participants.find(p => p.attendeeId === attendeeId);
        if (participant && participant.audio === 'speaking') {
          updateParticipant(attendeeId, { audio: muted ? 'muted' : 'unmuted' });
        }
      }
    };

    // Subscribe to local audio mute changes
    const handleLocalAudioMuted: RealtimeSubscribeToLocalAudioMutedCallback = (muted: boolean) => {
      logMessage(`Local audio ${muted ? 'muted' : 'unmuted'}`);
      setIsMuted(muted);
      updateParticipant(currentUserId, { audio: muted ? 'muted' : 'unmuted' });
    };

    // Subscribe to local video mute changes
    const handleLocalVideoMuted: RealtimeSubscribeToLocalVideoMutedCallback = (muted: boolean) => {
      logMessage(`Local video ${muted ? 'muted' : 'unmuted'}`);
      setIsVideoEnabled(!muted);
      updateParticipant(currentUserId, { video: muted ? 'off' : 'on' });
    };

    // Subscribe to remote audio mute changes
    const handleRemoteAudioMuted = (attendeeId: string, muted: boolean) => {
      logMessage(`Remote attendee ${attendeeId} audio ${muted ? 'muted' : 'unmuted'}`);
      updateParticipant(attendeeId, { audio: muted ? 'muted' : 'unmuted' });
    };

    // Subscribe to remote video mute changes
    const handleRemoteVideoMuted = (attendeeId: string, muted: boolean) => {
      logMessage(`Remote attendee ${attendeeId} video ${muted ? 'muted' : 'unmuted'}`);
      updateParticipant(attendeeId, { video: muted ? 'off' : 'on' });
    };

    // Subscribe to connection health changes
    const handleConnectionHealth = (attendeeId: string, health: number) => {
      let quality: Participant['connectionQuality'] = 'excellent';
      if (health < 0.5) quality = 'poor';
      else if (health < 0.7) quality = 'fair';
      else if (health < 0.9) quality = 'good';
      
      updateParticipant(attendeeId, { connectionQuality: quality });
    };

    try {
      // Subscribe to real-time events
      audioVideo.realtimeSubscribeToAttendeeIdPresence(handleAttendeePresence);
      audioVideo.realtimeSubscribeToVolumeIndicator(handleVolumeIndicator);
      audioVideo.realtimeSubscribeToLocalAudioMuted(handleLocalAudioMuted);
      audioVideo.realtimeSubscribeToLocalVideoMuted(handleLocalVideoMuted);
      
      // Subscribe to remote attendee changes
      audioVideo.realtimeSubscribeToAttendeeIdPresence((attendeeId: string, present: boolean) => {
        if (present && attendeeId !== currentUserId) {
          // Subscribe to remote attendee's audio/video state
          audioVideo.realtimeSubscribeToAttendeeIdPresence(attendeeId, (present: boolean) => {
            if (present) {
              audioVideo.realtimeSubscribeToVolumeIndicator(attendeeId, handleVolumeIndicator);
            }
          });
        }
      });

      logMessage('Chime SDK event listeners setup complete');
    } catch (error) {
      console.error('Error setting up Chime SDK event listeners:', error);
    }

    // Return cleanup function
    return () => {
      try {
        audioVideo.realtimeUnsubscribeFromAttendeeIdPresence(handleAttendeePresence);
        audioVideo.realtimeUnsubscribeFromVolumeIndicator(handleVolumeIndicator);
        audioVideo.realtimeUnsubscribeFromLocalAudioMuted(handleLocalAudioMuted);
        audioVideo.realtimeUnsubscribeFromLocalVideoMuted(handleLocalVideoMuted);
        logMessage('Chime SDK event listeners cleaned up');
      } catch (error) {
        console.error('Error cleaning up Chime SDK event listeners:', error);
      }
    };
  }, [addParticipant, removeParticipant, updateParticipant, participants, currentUserId]);

  // Enhanced participant management functions
  const handleMuteParticipant = useCallback((attendeeId: string) => {
    if (!audioVideoRef.current) return;
    
    try {
      // This would require server-side implementation for remote mute
      // For now, we'll update the UI state
      const participant = participants.find(p => p.attendeeId === attendeeId);
      if (participant) {
        if (participant.audio === 'muted') {
          unmuteParticipant(attendeeId);
        } else {
          muteParticipant(attendeeId);
        }
      }
    } catch (error) {
      console.error('Error muting participant:', error);
    }
  }, [participants, muteParticipant, unmuteParticipant]);

  const handleRemoveParticipant = useCallback((attendeeId: string) => {
    if (!audioVideoRef.current) return;
    
    try {
      // This would require server-side implementation for remote removal
      // For now, we'll update the UI state
      removeParticipantFromMeeting(attendeeId);
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  }, [removeParticipantFromMeeting]);

  const handlePromoteToCoHost = useCallback((attendeeId: string) => {
    try {
      // This would require server-side implementation for role changes
      // For now, we'll update the UI state
      promoteToCoHost(attendeeId);
    } catch (error) {
      console.error('Error promoting to co-host:', error);
    }
  }, [promoteToCoHost]);

  const handleDemoteFromCoHost = useCallback((attendeeId: string) => {
    try {
      // This would require server-side implementation for role changes
      // For now, we'll update the UI state
      demoteFromCoHost(attendeeId);
    } catch (error) {
      console.error('Error demoting from co-host:', error);
    }
  }, [demoteFromCoHost]);

  const handleMuteAll = useCallback(() => {
    try {
      muteAllParticipants();
    } catch (error) {
      console.error('Error muting all participants:', error);
    }
  }, [muteAllParticipants]);

  const handleMuteAllExceptHost = useCallback(() => {
    try {
      muteAllExceptHost();
    } catch (error) {
      console.error('Error muting all except host:', error);
    }
  }, [muteAllExceptHost]);

  // Initialize meeting session with event listeners
  const initializeChimeMeeting = async () => {
    try {
      logMessage('Initializing Chime meeting...');
      
      const response = await fetch(`${SERVERLESS_API_BASE}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meeting.title,
          attendeeName: meeting.host_id
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join meeting: ${response.status}`);
      }

      const result = await response.json();
      logMessage('Meeting join successful');

      // Create meeting session configuration
      const configuration = new MeetingSessionConfiguration(
        result.JoinInfo.Meeting,
        result.JoinInfo.Attendee
      );

      // Create logger
      const logger = new ConsoleLogger('ChimeSDKServerless', LogLevel.INFO);
      loggerRef.current = logger;

      // Create device controller
      const deviceController = new DefaultDeviceController(logger, {
        enableWebAudio: true,
        enableUnifiedPlanForChromiumBasedBrowsers: true,
      });

      // Create meeting session
      const session = new DefaultMeetingSession(
        configuration,
        logger,
        deviceController
      );

      setMeetingSession(session);
      audioVideoRef.current = session.audioVideo;

      // Setup event listeners
      const cleanup = setupChimeEventListeners(session.audioVideo);

      // Start the meeting
      await session.audioVideo.start();
      setIsConnected(true);
      logMessage('Meeting started successfully');

      return cleanup;
    } catch (error) {
      console.error('Error initializing Chime meeting:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to join meeting');
      throw error;
    }
  };

  // Rest of the component implementation would continue here...
  // (This is a partial implementation focusing on the Chime SDK integration)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        {/* Video elements */}
        <video
          ref={localVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <video
          ref={remoteVideoRef}
          className="absolute top-0 left-0 w-1/3 h-1/3 object-cover"
          autoPlay
          playsInline
        />
      </div>
      
      {/* Meeting controls would go here */}
      <div className="p-4 bg-gray-900 text-white">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              if (audioVideoRef.current) {
                if (isMuted) {
                  audioVideoRef.current.realtimeSetLocalAudioMuted(false);
                } else {
                  audioVideoRef.current.realtimeSetLocalAudioMuted(true);
                }
              }
            }}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'}`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          
          <button
            onClick={() => {
              if (audioVideoRef.current) {
                if (isVideoEnabled) {
                  audioVideoRef.current.stopLocalVideoTile();
                } else {
                  audioVideoRef.current.startLocalVideoTile();
                }
              }
            }}
            className={`p-3 rounded-full ${!isVideoEnabled ? 'bg-red-500' : 'bg-gray-600'}`}
          >
            {isVideoEnabled ? 'Stop Video' : 'Start Video'}
          </button>
          
          <button
            onClick={onLeave}
            className="p-3 rounded-full bg-red-600"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

// Wrapper component that provides the ParticipantProvider
const ChimeSDKServerlessEnhancedWrapper: React.FC<ChimeSDKServerlessEnhancedProps> = (props) => {
  return (
    <ParticipantProvider 
      meetingSession={null} 
      currentUserId={props.currentUserId}
    >
      <ChimeSDKServerlessEnhanced {...props} />
    </ParticipantProvider>
  );
};

export default ChimeSDKServerlessEnhancedWrapper;
