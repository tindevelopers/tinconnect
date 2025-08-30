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
  Share,
  MoreVertical,
  Copy,
  UserPlus,
  Monitor,
  MonitorOff
} from 'lucide-react';
import { Meeting } from '@shared/api';

interface ChimeVideoMeetingProps {
  meeting: Meeting;
  joinData?: any; // Chime join data
  onLeave: () => void;
}

export const ChimeVideoMeeting: React.FC<ChimeVideoMeetingProps> = ({ 
  meeting, 
  joinData, 
  onLeave 
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [participants, setParticipants] = useState([
    { id: '1', name: 'You', isLocal: true, isAudioMuted, isVideoEnabled, isScreenSharing: false },
  ]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Generate meeting link for sharing
    const link = `${window.location.origin}/join-meeting?meetingId=${meeting.id}`;
    setMeetingLink(link);
    
    // Simulate connection to Chime SDK
    const connectToChime = async () => {
      try {
        setIsConnecting(true);
        setConnectionError(null);
        
        // Here you would integrate with the actual Chime SDK
        // For now, we'll simulate the connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Add some mock participants
        setParticipants(prev => [
          ...prev,
          { id: '2', name: 'John Doe', isLocal: false, isAudioMuted: false, isVideoEnabled: true, isScreenSharing: false },
          { id: '3', name: 'Jane Smith', isLocal: false, isAudioMuted: true, isVideoEnabled: false, isScreenSharing: false },
        ]);
        
        setIsConnecting(false);
      } catch (error) {
        setConnectionError('Failed to connect to meeting');
        setIsConnecting(false);
      }
    };

    connectToChime();
  }, [meeting.id]);

  const toggleMute = () => {
    setIsAudioMuted(!isAudioMuted);
    // Here you would call Chime SDK to mute/unmute audio
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Here you would call Chime SDK to enable/disable video
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // Here you would call Chime SDK to start/stop screen sharing
  };

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to copy meeting link:', error);
    }
  };

  const inviteParticipants = () => {
    // Open invite dialog or copy link
    copyMeetingLink();
  };

  if (isConnecting) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
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
          <Button onClick={onLeave} variant="outline">
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
          <Button variant="outline" size="sm" onClick={onLeave}>
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
            {participants.map((participant) => (
              <Card key={participant.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4 h-48 flex flex-col items-center justify-center relative">
                  {/* Video Placeholder */}
                  <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  {/* Participant Name */}
                  <p className="text-white text-sm font-medium text-center">
                    {participant.name}
                    {participant.isLocal && ' (You)'}
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
                  
                  {/* Local User Indicator */}
                  {participant.isLocal && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className="text-xs bg-blue-600 text-white">
                        You
                      </Badge>
                    </div>
                  )}
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
          onClick={onLeave}
          className="rounded-full w-12 h-12 p-0"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
