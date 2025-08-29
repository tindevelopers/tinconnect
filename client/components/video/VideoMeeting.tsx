import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
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
  MoreVertical
} from 'lucide-react';
import { Meeting } from '../../../server/lib/database.types';

interface VideoMeetingProps {
  meeting: Meeting;
  onLeave: () => void;
}

export const VideoMeeting: React.FC<VideoMeetingProps> = ({ meeting, onLeave }) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants] = useState([
    { id: '1', name: 'You', isLocal: true, isAudioMuted, isVideoEnabled },
    { id: '2', name: 'John Doe', isLocal: false, isAudioMuted: false, isVideoEnabled: true },
    { id: '3', name: 'Jane Smith', isLocal: false, isAudioMuted: true, isVideoEnabled: false },
  ]);

  const toggleMute = () => {
    setIsAudioMuted(!isAudioMuted);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-lg font-semibold">{meeting.title}</h1>
          <Badge variant="secondary" className="bg-green-500 text-white">
            Live
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm">
            {participants.length} participants
          </span>
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
                <CardContent className="p-4 h-48 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-white text-sm font-medium text-center">
                    {participant.name}
                    {participant.isLocal && ' (You)'}
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    {participant.isAudioMuted && (
                      <MicOff className="w-4 h-4 text-red-400" />
                    )}
                    {!participant.isVideoEnabled && (
                      <VideoOff className="w-4 h-4 text-red-400" />
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
              <h3 className="text-white font-semibold mb-2">Participants</h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">{participant.name}</span>
                    {participant.isLocal && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div>
              <h3 className="text-white font-semibold mb-2">Chat</h3>
              <div className="bg-gray-700 rounded p-3 h-32 overflow-y-auto">
                <p className="text-gray-400 text-sm">Chat feature coming soon...</p>
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
          <Share className="w-5 h-5" />
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
