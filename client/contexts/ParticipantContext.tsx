import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Participant, ParticipantPermissions } from '../components/meetings/ParticipantList';

interface ParticipantContextType {
  participants: Participant[];
  currentUserId: string | null;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (attendeeId: string) => void;
  updateParticipant: (attendeeId: string, updates: Partial<Participant>) => void;
  muteParticipant: (attendeeId: string) => void;
  unmuteParticipant: (attendeeId: string) => void;
  removeParticipantFromMeeting: (attendeeId: string) => void;
  promoteToCoHost: (attendeeId: string) => void;
  demoteFromCoHost: (attendeeId: string) => void;
  muteAllParticipants: () => void;
  muteAllExceptHost: () => void;
  getParticipantById: (attendeeId: string) => Participant | undefined;
  getCurrentUser: () => Participant | undefined;
  isHost: boolean;
  isCoHost: boolean;
}

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

interface ParticipantProviderProps {
  children: React.ReactNode;
  meetingSession?: any; // Chime SDK meeting session
  currentUserId: string;
}

export const ParticipantProvider: React.FC<ParticipantProviderProps> = ({
  children,
  meetingSession,
  currentUserId
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isCoHost, setIsCoHost] = useState(false);

  // Initialize current user as host (first participant)
  useEffect(() => {
    if (participants.length === 0 && currentUserId) {
      const currentUser: Participant = {
        attendeeId: currentUserId,
        externalUserId: currentUserId,
        name: 'You', // This will be updated with actual user name
        role: 'host',
        status: 'connected',
        audio: 'unmuted',
        video: 'on',
        isLocal: true,
        joinTime: new Date(),
        connectionQuality: 'excellent',
        permissions: {
          canMuteOthers: true,
          canRemoveOthers: true,
          canPromoteToHost: true,
          canRecord: true,
          canShareScreen: true,
        },
      };
      setParticipants([currentUser]);
      setIsHost(true);
    }
  }, [currentUserId, participants.length]);

  const addParticipant = useCallback((participant: Participant) => {
    setParticipants(prev => {
      const exists = prev.find(p => p.attendeeId === participant.attendeeId);
      if (exists) return prev;
      return [...prev, participant];
    });
  }, []);

  const removeParticipant = useCallback((attendeeId: string) => {
    setParticipants(prev => prev.filter(p => p.attendeeId !== attendeeId));
  }, []);

  const updateParticipant = useCallback((attendeeId: string, updates: Partial<Participant>) => {
    setParticipants(prev => 
      prev.map(p => 
        p.attendeeId === attendeeId ? { ...p, ...updates } : p
      )
    );
  }, []);

  const muteParticipant = useCallback((attendeeId: string) => {
    updateParticipant(attendeeId, { audio: 'muted' });
    // TODO: Implement actual Chime SDK mute functionality
  }, [updateParticipant]);

  const unmuteParticipant = useCallback((attendeeId: string) => {
    updateParticipant(attendeeId, { audio: 'unmuted' });
    // TODO: Implement actual Chime SDK unmute functionality
  }, [updateParticipant]);

  const removeParticipantFromMeeting = useCallback((attendeeId: string) => {
    // TODO: Implement actual Chime SDK remove functionality
    removeParticipant(attendeeId);
  }, [removeParticipant]);

  const promoteToCoHost = useCallback((attendeeId: string) => {
    updateParticipant(attendeeId, { 
      role: 'co-host',
      permissions: {
        canMuteOthers: true,
        canRemoveOthers: true,
        canPromoteToHost: false,
        canRecord: true,
        canShareScreen: true,
      }
    });
  }, [updateParticipant]);

  const demoteFromCoHost = useCallback((attendeeId: string) => {
    updateParticipant(attendeeId, { 
      role: 'participant',
      permissions: {
        canMuteOthers: false,
        canRemoveOthers: false,
        canPromoteToHost: false,
        canRecord: false,
        canShareScreen: true,
      }
    });
  }, [updateParticipant]);

  const muteAllParticipants = useCallback(() => {
    participants.forEach(participant => {
      if (!participant.isLocal && participant.audio !== 'muted') {
        muteParticipant(participant.attendeeId);
      }
    });
  }, [participants, muteParticipant]);

  const muteAllExceptHost = useCallback(() => {
    participants.forEach(participant => {
      if (!participant.isLocal && participant.role !== 'host' && participant.audio !== 'muted') {
        muteParticipant(participant.attendeeId);
      }
    });
  }, [participants, muteParticipant]);

  const getParticipantById = useCallback((attendeeId: string) => {
    return participants.find(p => p.attendeeId === attendeeId);
  }, [participants]);

  const getCurrentUser = useCallback(() => {
    return participants.find(p => p.isLocal);
  }, [participants]);

  // Update host/co-host status based on current user
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setIsHost(currentUser.role === 'host');
      setIsCoHost(currentUser.role === 'co-host');
    }
  }, [participants, getCurrentUser]);

  // TODO: Integrate with Chime SDK for real-time updates
  useEffect(() => {
    if (!meetingSession) return;

    // Subscribe to attendee presence changes
    const handleAttendeePresence = (attendeeId: string, present: boolean) => {
      if (present) {
        // New attendee joined
        const newParticipant: Participant = {
          attendeeId,
          externalUserId: attendeeId, // This should come from Chime SDK
          name: `Participant ${attendeeId.slice(-4)}`, // Temporary name
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

    // Subscribe to audio level changes for speaking detection
    const handleAudioLevel = (attendeeId: string, level: number) => {
      if (level > 0.1) { // Threshold for speaking
        updateParticipant(attendeeId, { audio: 'speaking' });
      } else {
        const participant = getParticipantById(attendeeId);
        if (participant && participant.audio === 'speaking') {
          updateParticipant(attendeeId, { audio: 'unmuted' });
        }
      }
    };

    // Subscribe to mute/unmute changes
    const handleMuteChange = (attendeeId: string, muted: boolean) => {
      updateParticipant(attendeeId, { audio: muted ? 'muted' : 'unmuted' });
    };

    // TODO: Add actual Chime SDK event listeners
    // meetingSession.audioVideo.realtimeSubscribeToAttendeeIdPresence(handleAttendeePresence);
    // meetingSession.audioVideo.realtimeSubscribeToVolumeIndicator(handleAudioLevel);
    // meetingSession.audioVideo.realtimeSubscribeToLocalAudioMuted(handleMuteChange);

    return () => {
      // TODO: Clean up Chime SDK event listeners
    };
  }, [meetingSession, addParticipant, removeParticipant, updateParticipant, getParticipantById]);

  const value: ParticipantContextType = {
    participants,
    currentUserId,
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
    getParticipantById,
    getCurrentUser,
    isHost,
    isCoHost,
  };

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
};

export const useParticipants = () => {
  const context = useContext(ParticipantContext);
  if (context === undefined) {
    throw new Error('useParticipants must be used within a ParticipantProvider');
  }
  return context;
};
