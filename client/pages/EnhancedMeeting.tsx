import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Monitor,
  MoreHorizontal,
  Volume2,
  Settings,
  Users,
  MessageSquare,
  Maximize2,
  Share
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MeetingInfo {
  meetingId: string;
  userName: string;
}

interface Participant {
  id: string;
  name: string;
  isLocal: boolean;
  isAudioMuted: boolean;
  isVideoEnabled: boolean;
  isActiveSpeaker?: boolean;
  avatar?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
}

export default function EnhancedMeeting() {
  const location = useLocation();
  const navigate = useNavigate();
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  
  const [participants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Erica',
      isLocal: true,
      isAudioMuted: false,
      isVideoEnabled: true,
      isActiveSpeaker: true,
      avatar: '/api/placeholder/140/140'
    },
    {
      id: '2',
      name: 'Ailani',
      isLocal: false,
      isAudioMuted: false,
      isVideoEnabled: true,
      avatar: '/api/placeholder/140/140'
    },
    {
      id: '3',
      name: 'Richard',
      isLocal: false,
      isAudioMuted: true,
      isVideoEnabled: true,
      avatar: '/api/placeholder/140/140'
    },
    {
      id: '4',
      name: 'Madison',
      isLocal: false,
      isAudioMuted: false,
      isVideoEnabled: false,
      avatar: '/api/placeholder/140/140'
    }
  ]);

  const [chatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Madison',
      message: "Hey, is it Lou's b-day next week?",
      timestamp: '3:39 PM',
      isOwn: false
    },
    {
      id: '2',
      sender: 'You',
      message: 'Almost forgot! 😊\nBeen quite busy, damn.',
      timestamp: '3:40 PM',
      isOwn: true
    },
    {
      id: '3',
      sender: 'Madison',
      message: "Haha that's okay, we all know about it.",
      timestamp: '3:42 PM',
      isOwn: false
    }
  ]);

  useEffect(() => {
    const stateInfo = location.state as MeetingInfo;
    const storedInfo = sessionStorage.getItem('pendingMeeting');

    if (stateInfo) {
      setMeetingInfo(stateInfo);
    } else if (storedInfo) {
      setMeetingInfo(JSON.parse(storedInfo));
    } else {
      navigate('/join-meeting');
      return;
    }
  }, [location.state, navigate]);

  const handleLeaveMeeting = () => {
    sessionStorage.removeItem('pendingMeeting');
    sessionStorage.removeItem('joinMethod');
    navigate('/improved-dashboard');
  };

  const toggleMute = () => {
    setIsAudioMuted(!isAudioMuted);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message
      setNewMessage('');
    }
  };

  if (!meetingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">TIN Connect</h1>
          <p className="text-gray-500">Loading meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Sidebar - Controls */}
      <div className="w-full lg:w-24 bg-white border-r lg:border-r border-b lg:border-b-0 border-gray-200 flex lg:flex-col flex-row items-center justify-around lg:justify-start py-4 lg:py-6 space-x-4 lg:space-x-0 lg:space-y-6">
        {/* Share Screen */}
        <button 
          onClick={toggleScreenShare}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
            isScreenSharing ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <Share className="w-6 h-6" />
        </button>

        {/* Record */}
        <button 
          onClick={toggleRecording}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
            isRecording ? "bg-red-500 text-white" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <div className="w-6 h-6 rounded-full border-2 border-current"></div>
        </button>

        {/* Participants */}
        <button className="w-16 h-16 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-100">
          <Users className="w-6 h-6" />
        </button>

        {/* Video Camera Toggle */}
        <button 
          onClick={toggleVideo}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
            !isVideoEnabled ? "bg-red-500 text-white" : "bg-blue-600 text-white"
          )}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        {/* Settings */}
        <button className="w-16 h-16 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-100">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Main Meeting Area */}
      <div className="flex-1 bg-gray-50 p-6 relative">
        {/* Meeting Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-700">Meeting ID: {meetingInfo.meetingId}</div>
              <div className="text-xl text-gray-500">24:40</div>
            </div>
          </div>

          {/* Active Speaker Indicator */}
          <div className="flex items-center space-x-3 bg-white rounded-2xl px-6 py-3 shadow-sm">
            <Mic className="w-6 h-6 text-green-500" />
            <div>
              <div className="text-sm text-gray-600">Active Speaker</div>
              <div className="text-lg font-medium text-gray-700">Erica</div>
            </div>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center space-x-3 bg-white rounded-2xl px-6 py-3 shadow-sm">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Screen recording. <span className="text-blue-600 cursor-pointer">Stop here.</span></span>
            </div>
          )}
        </div>

        {/* Participant Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {participants.map((participant) => (
            <Card key={participant.id} className="relative overflow-hidden bg-gray-800 border-0">
              <CardContent className="p-0 h-36">
                {participant.isVideoEnabled ? (
                  <div className="relative w-full h-full">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                    {participant.isActiveSpeaker && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-tr-2xl px-4 py-2">
                      <span className="text-gray-700 font-medium">{participant.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white text-lg font-bold">
                          {participant.name[0]}
                        </span>
                      </div>
                      <span className="text-white text-sm">{participant.name}</span>
                    </div>
                  </div>
                )}
                {participant.isAudioMuted && (
                  <div className="absolute top-3 left-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Meeting Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={toggleMute}
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              isAudioMuted ? "bg-red-500 text-white" : "bg-gray-600 bg-opacity-60 text-white hover:bg-opacity-80"
            )}
          >
            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button 
            onClick={toggleVideo}
            className="w-16 h-16 rounded-2xl bg-gray-600 bg-opacity-60 text-white hover:bg-opacity-80 flex items-center justify-center"
          >
            <Video className="w-6 h-6" />
          </button>

          <button className="w-16 h-16 rounded-2xl bg-gray-600 bg-opacity-60 text-white hover:bg-opacity-80 flex items-center justify-center">
            <Monitor className="w-6 h-6" />
          </button>

          <button className="w-16 h-16 rounded-2xl bg-gray-600 bg-opacity-60 text-white hover:bg-opacity-80 flex items-center justify-center">
            <Maximize2 className="w-6 h-6" />
          </button>

          <button 
            onClick={handleLeaveMeeting}
            className="w-24 h-24 rounded-2xl bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 space-y-4">
          {/* Volume Control */}
          <div className="w-14 h-64 bg-gray-600 bg-opacity-60 rounded-2xl flex flex-col items-center py-6">
            <div className="flex-1 relative w-1">
              <div className="absolute bottom-0 w-1 h-24 bg-gray-400 rounded-full"></div>
              <div className="absolute bottom-0 w-1 h-16 bg-teal-500 rounded-full"></div>
              <div className="absolute bottom-14 w-6 h-6 bg-white rounded-full border-2 border-gray-300 -ml-2.5"></div>
            </div>
            <Volume2 className="w-8 h-8 text-white mt-4" />
          </div>

          {/* Microphone Control */}
          <div className="w-14 h-64 bg-gray-600 bg-opacity-60 rounded-2xl flex flex-col items-center py-6">
            <div className="flex-1 relative w-1">
              <div className="absolute bottom-0 w-1 h-20 bg-gray-400 rounded-full"></div>
              <div className="absolute bottom-0 w-1 h-24 bg-teal-500 rounded-full"></div>
              <div className="absolute bottom-16 w-6 h-6 bg-white rounded-full border-2 border-gray-300 -ml-2.5"></div>
            </div>
            <Mic className="w-6 h-6 text-white mt-4" />
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {chatVisible && (
        <div className="w-96 bg-gray-50 border-l border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setChatVisible(false)}
                className="p-3 bg-white rounded-2xl shadow-sm"
              >
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-3xl font-medium text-blue-600">Chat</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl text-gray-500">Private: Madison</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4 mb-6 h-96 overflow-y-auto">
            {chatMessages.map((message) => (
              <div key={message.id} className={cn("flex", message.isOwn ? "justify-end" : "items-start space-x-3")}>
                {!message.isOwn && (
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="/api/placeholder/64/64" alt={message.sender} />
                    <AvatarFallback>{message.sender[0]}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn("max-w-sm", message.isOwn ? "text-right" : "flex-1")}>
                  <div className={cn(
                    "p-4 shadow-sm",
                    message.isOwn 
                      ? "bg-blue-600 text-white rounded-2xl rounded-tr-none" 
                      : "bg-white rounded-2xl rounded-tl-none"
                  )}>
                    {!message.isOwn && (
                      <div className="text-blue-600 font-medium text-lg mb-1">{message.sender}</div>
                    )}
                    <div className={cn(
                      "text-xl whitespace-pre-line",
                      message.isOwn ? "text-white" : "text-gray-500"
                    )}>
                      {message.message}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{message.timestamp}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-white rounded-2xl px-4 py-3 flex items-center space-x-3 shadow-sm">
              <button className="text-gray-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Enter your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 text-xl text-gray-500 bg-transparent border-none outline-none"
              />
              <button className="text-gray-400">
                <svg className="w-7 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <Button 
              onClick={sendMessage}
              className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-2xl p-0"
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
