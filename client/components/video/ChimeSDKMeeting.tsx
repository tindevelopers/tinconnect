import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Settings,
  Users,
  MessageSquare,
  Copy,
  UserPlus,
  Monitor,
  MonitorOff,
  Loader2
} from 'lucide-react';
import { Meeting } from '@shared/api';
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
  MeetingSessionCredentials,
  MeetingSessionURLs,
  Device,
  AudioVideoFacade,
  MeetingSessionStatus,
  MeetingSessionStatusCode
} from 'amazon-chime-sdk-js';

interface ChimeSDKMeetingProps {
  meeting: Meeting;
  joinData?: any; // Chime join data from server
  onLeave: () => void;
}

export const ChimeSDKMeeting: React.FC<ChimeSDKMeetingProps> = ({ 
  meeting, 
  joinData, 
  onLeave 
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  // Chime SDK refs
  const meetingSessionRef = useRef<DefaultMeetingSession | null>(null);
  const audioVideoRef = useRef<AudioVideoFacade | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const loggerRef = useRef<ConsoleLogger | null>(null);

  useEffect(() => {
    // Generate meeting link for sharing
    const link = `${window.location.origin}/join-meeting?meetingId=${meeting.id}`;
    setMeetingLink(link);
    
    // Initialize Chime SDK meeting
    initializeChimeMeeting();
  }, [meeting.id]);

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
        throw new Error('No camera devices found');
      }
      
      if (audioDevices.length === 0) {
        throw new Error('No microphone devices found');
      }
      
      console.log('Device check passed');
    } catch (error) {
      console.error('Device check failed:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new Error('Camera and microphone permissions are required');
      } else if (error instanceof Error && error.message.includes('No camera devices found')) {
        throw new Error('No camera devices found. Please connect a camera and try again.');
      } else if (error instanceof Error && error.message.includes('No microphone devices found')) {
        throw new Error('No microphone devices found. Please connect a microphone and try again.');
      } else {
        throw error;
      }
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

      // Fetch actual Chime meeting configuration from server
      const response = await fetch(`/api/meetings/${meeting.id}/chime-config`);
      if (!response.ok) {
        throw new Error('Failed to get meeting configuration');
      }
      
      const configData = await response.json();
      if (!configData.success) {
        throw new Error(configData.error || 'Failed to get meeting configuration');
      }

      const chimeMeeting = configData.data.meeting;
      console.log('ChimeSDKMeeting: Retrieved meeting config:', chimeMeeting);

      // Create meeting session configuration with real data
      const configuration = new MeetingSessionConfiguration(
        {
          Meeting: {
            MeetingId: chimeMeeting.MeetingId,
            ExternalMeetingId: chimeMeeting.ExternalMeetingId,
            MediaRegion: chimeMeeting.MediaRegion,
            MediaPlacement: chimeMeeting.MediaPlacement
          }
        },
        {
          Attendee: {
            AttendeeId: joinData?.attendee?.AttendeeId || 'test-attendee-id',
            ExternalUserId: joinData?.attendee?.ExternalUserId || 'test-user',
            JoinToken: joinData?.attendee?.JoinToken || 'test-token'
          }
        }
      );

      // Create device controller
      const deviceController = new DefaultDeviceController(loggerRef.current);

      // Create meeting session
      meetingSessionRef.current = new DefaultMeetingSession(
        configuration,
        loggerRef.current,
        deviceController
      );

      audioVideoRef.current = meetingSessionRef.current.audioVideo;

      // Set up event listeners
      setupEventListeners();

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

  const setupEventListeners = () => {
    if (!audioVideoRef.current) return;

    // Audio video events
    audioVideoRef.current.addDeviceChangeObserver({
      audioInputsChanged: (freshAudioInputDeviceList: MediaDeviceInfo[]) => {
        console.log('Audio inputs changed:', freshAudioInputDeviceList);
      },
      videoInputsChanged: (freshVideoInputDeviceList: MediaDeviceInfo[]) => {
        console.log('Video inputs changed:', freshVideoInputDeviceList);
      },
      audioOutputsChanged: (freshAudioOutputDeviceList: MediaDeviceInfo[]) => {
        console.log('Audio outputs changed:', freshAudioOutputDeviceList);
      },
      devicesChanged: (freshDeviceList: MediaDeviceInfo[]) => {
        console.log('Devices changed:', freshDeviceList);
      }
    });

    // Meeting session events - using the correct observer pattern
    const observer = {
      audioVideoDidStart: () => {
        console.log('Audio video started');
        setIsConnecting(false);
      },
      audioVideoDidStartConnecting: (reconnecting: boolean) => {
        console.log('Audio video connecting:', reconnecting);
      },
      audioVideoDidStop: (sessionStatus: MeetingSessionStatus) => {
        console.log('Audio video stopped:', sessionStatus);
        if (sessionStatus.statusCode() === MeetingSessionStatusCode.Left) {
          onLeave();
        }
      },
      audioVideoDidFail: (sessionStatus: MeetingSessionStatus) => {
        console.log('Audio video failed:', sessionStatus);
        setConnectionError('Meeting connection failed. Please try again.');
        setIsConnecting(false);
      }
    };

    // Add the observer using the correct method
    if (audioVideoRef.current && typeof audioVideoRef.current.addObserver === 'function') {
      audioVideoRef.current.addObserver(observer);
    } else {
      console.warn('AudioVideo addObserver method not available');
    }

    // Real-time events
    audioVideoRef.current.realtimeSubscribeToVolumeIndicator(
      joinData?.attendee?.AttendeeId || 'test-attendee-id',
      (attendeeId: string, volume: number, muted: boolean, signalStrength: number) => {
        console.log('Volume indicator:', { attendeeId, volume, muted, signalStrength });
      }
    );

    audioVideoRef.current.realtimeSubscribeToLocalAudioLevel((level: number) => {
      console.log('Local audio level:', level);
    });
  };

  const startMeeting = async () => {
    if (!audioVideoRef.current) return;

    try {
      // Request camera and microphone permissions first
      console.log('Requesting camera and microphone permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      console.log('Camera and microphone permissions granted');

      // Start audio video
      await audioVideoRef.current.start();

      // Bind local video
      if (localVideoRef.current) {
        audioVideoRef.current.startLocalVideo();
        audioVideoRef.current.bindVideoElement(0, localVideoRef.current);
      }

      // Update participants list
      updateParticipantsList();

    } catch (error) {
      console.error('Error starting meeting:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setConnectionError('Camera and microphone permissions are required. Please allow access and try again.');
      } else {
        setConnectionError('Failed to start meeting. Please check your camera and microphone permissions.');
      }
      setIsConnecting(false);
    }
  };

  const updateParticipantsList = () => {
    if (!audioVideoRef.current) return;

    const roster = audioVideoRef.current.getRoster();
    const participantList = Object.values(roster).map((attendee: any) => ({
      id: attendee.attendeeId,
      name: attendee.externalUserId || 'Unknown',
      isLocal: attendee.attendeeId === (joinData?.attendee?.AttendeeId || 'test-attendee-id'),
      isAudioMuted: false, // Will be updated by real-time events
      isVideoEnabled: true, // Will be updated by real-time events
      isScreenSharing: false
    }));

    setParticipants(participantList);
  };

  const toggleMute = async () => {
    if (!audioVideoRef.current) return;

    try {
      if (isAudioMuted) {
        await audioVideoRef.current.realtimeUnmuteLocalAudio();
      } else {
        await audioVideoRef.current.realtimeMuteLocalAudio();
      }
      setIsAudioMuted(!isAudioMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const toggleVideo = async () => {
    if (!audioVideoRef.current) return;

    try {
      if (isVideoEnabled) {
        await audioVideoRef.current.stopLocalVideo();
      } else {
        await audioVideoRef.current.startLocalVideo();
      }
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const toggleScreenShare = async () => {
    if (!audioVideoRef.current) return;

    try {
      if (!isScreenSharing) {
        await audioVideoRef.current.startContentShare();
        setIsScreenSharing(true);
      } else {
        await audioVideoRef.current.stopContentShare();
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
    } catch (error) {
      console.error('Failed to copy meeting link:', error);
    }
  };

  const inviteParticipants = () => {
    copyMeetingLink();
  };

  const handleLeave = async () => {
    if (audioVideoRef.current) {
      await audioVideoRef.current.stop();
    }
    onLeave();
  };

  if (isConnecting) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Connecting to Meeting</h2>
          <p className="text-gray-400">Establishing connection with AWS Chime SDK...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-800">{connectionError}</AlertDescription>
          </Alert>
          <Button onClick={handleLeave} variant="outline">
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave Meeting
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-lg font-semibold">{meeting.title}</h1>
          <Badge variant="secondary" className="bg-green-500 text-white">
            Live
          </Badge>
          <Badge variant="outline" className="text-xs">
            AWS Chime SDK
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm">
            {participants.length} participants
          </span>
          <Button variant="outline" size="sm" onClick={copyMeetingLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={inviteParticipants}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
          <Button variant="outline" size="sm" onClick={handleLeave}>
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
            {/* Local Video */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 h-48 flex flex-col items-center justify-center relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg"
                />
                
                {/* Participant Name */}
                <p className="text-white text-sm font-medium text-center mt-2">
                  You
                </p>
                
                {/* Status Indicators */}
                <div className="flex items-center space-x-1 mt-2">
                  {isAudioMuted && (
                    <MicOff className="w-4 h-4 text-red-400" />
                  )}
                  {!isVideoEnabled && (
                    <VideoOff className="w-4 h-4 text-red-400" />
                  )}
                  {isScreenSharing && (
                    <Monitor className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                
                {/* Local User Indicator */}
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="text-xs bg-blue-600 text-white">
                    You
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Remote Participants */}
            {participants.filter(p => !p.isLocal).map((participant) => (
              <Card key={participant.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4 h-48 flex flex-col items-center justify-center relative">
                  {/* Video Placeholder - Will be replaced with actual remote video */}
                  <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  {/* Participant Name */}
                  <p className="text-white text-sm font-medium text-center">
                    {participant.name}
                  </p>
                  
                  {/* Status Indicators */}
                  <div className="flex items-center space-x-1 mt-2">
                    {participant.isAudioMuted && (
                      <MicOff className="w-4 h-4 text-red-400" />
                    )}
                    {!participant.isVideoEnabled && (
                      <VideoOff className="w-4 h-4 text-red-400" />
                    )}
                    {participant.isScreenSharing && (
                      <Monitor className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <div className="space-y-4">
            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Participants</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowParticipants(!showParticipants)}
                >
                  <Users className="w-4 h-4" />
                </Button>
              </div>
              {showParticipants && (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300">{participant.name}</span>
                      {participant.isLocal && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                      {participant.isAudioMuted && (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                      {!participant.isVideoEnabled && (
                        <VideoOff className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
              {showChat && (
                <div className="bg-gray-700 rounded p-3 h-32 overflow-y-auto">
                  <p className="text-gray-400 text-sm">Chat feature coming soon...</p>
                </div>
              )}
            </div>

            {/* Meeting Info */}
            <div>
              <h3 className="text-white font-semibold mb-2">Meeting Info</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div>
                  <span className="font-medium">Meeting ID:</span> {meeting.id}
                </div>
                <div>
                  <span className="font-medium">Chime Meeting ID:</span> {meeting.chime_meeting_id}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {meeting.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
        <Button
          variant={isAudioMuted ? "destructive" : "outline"}
          size="lg"
          onClick={toggleMute}
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>

        <Button
          variant={!isVideoEnabled ? "destructive" : "outline"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 p-0"
        >
          {!isVideoEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </Button>

        <Button
          variant={isScreenSharing ? "default" : "outline"}
          size="lg"
          onClick={toggleScreenShare}
          className="rounded-full w-12 h-12 p-0"
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <Settings className="w-5 h-5" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeave}
          className="rounded-full w-12 h-12 p-0"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
