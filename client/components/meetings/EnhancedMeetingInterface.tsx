import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  MoreHorizontal,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Share,
  Monitor,
  Circle,
  Square,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { useParticipants } from '../../contexts/ParticipantContext';
import ParticipantList from './ParticipantList';
import ChimeSDKServerless from '../video/ChimeSDKServerless';
import { cn } from '../../lib/utils';

interface EnhancedMeetingInterfaceProps {
  meeting: {
    id: string;
    title: string;
    description: string;
    host_id: string;
  };
  currentUserId: string;
  onLeave: () => void;
}

const EnhancedMeetingInterface: React.FC<EnhancedMeetingInterfaceProps> = ({
  meeting,
  currentUserId,
  onLeave
}) => {
  const [activeTab, setActiveTab] = useState('participants');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Chime SDK state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const { participants, isHost, isCoHost } = useParticipants();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual recording functionality
  };

  const toggleScreenSharing = () => {
    setIsScreenSharing(!isScreenSharing);
    // TODO: Implement actual screen sharing functionality
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  // Chime SDK control functions - these will be connected to the actual Chime SDK
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Connect to actual Chime SDK mute function
    console.log('Toggle mute:', !isMuted);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // TODO: Connect to actual Chime SDK video toggle function
    console.log('Toggle video:', !isVideoEnabled);
  };

  return (
    <div className={cn(
      "flex h-screen bg-gray-900",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Video Component */}
        <div className="w-full h-full">
          <ChimeSDKServerless
            meeting={meeting}
            onLeave={onLeave}
          />
        </div>
        
        {/* Meeting Info Overlay - Fixed positioning */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-black/50 text-white">
              {participants.length} participants
            </Badge>
            <Badge variant="secondary" className="bg-black/50 text-white">
              {isRecording ? 'Recording' : 'Live'}
            </Badge>
            {isScreenSharing && (
              <Badge variant="secondary" className="bg-blue-500 text-white">
                Screen Sharing
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-black/50 text-white hover:bg-black/70"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Meeting Controls - Fixed Layout and Responsive */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 bg-black/50 rounded-full p-3 backdrop-blur-sm">
            {/* Audio Control */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className={cn(
                "rounded-full w-12 h-12 flex items-center justify-center transition-all",
                isMuted 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-gray-700 text-white hover:bg-gray-600"
              )}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            {/* Video Control */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVideo}
              className={cn(
                "rounded-full w-12 h-12 flex items-center justify-center transition-all",
                !isVideoEnabled 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-gray-700 text-white hover:bg-gray-600"
              )}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            
            {/* Screen Share Control */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleScreenSharing}
              className={cn(
                "rounded-full w-12 h-12 flex items-center justify-center transition-all",
                isScreenSharing 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-gray-700 text-white hover:bg-gray-600"
              )}
            >
              <Share className="w-5 h-5" />
            </Button>
            
            {/* Recording Control - Only for Host/Co-Host */}
            {(isHost || isCoHost) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                className={cn(
                  "rounded-full w-12 h-12 flex items-center justify-center transition-all",
                  isRecording 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "bg-gray-700 text-white hover:bg-gray-600"
                )}
              >
                {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </Button>
            )}
            
            {/* Separator */}
            <div className="w-px h-8 bg-gray-600 mx-2"></div>
            
            {/* Leave Meeting */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeave}
              className="rounded-full bg-red-600 text-white hover:bg-red-700 w-12 h-12 flex items-center justify-center transition-all"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar - Responsive */}
      <div className={cn(
        "w-80 bg-white border-l border-gray-200 flex flex-col transition-all duration-300",
        isSidebarCollapsed && "w-16",
        "max-lg:w-64", // Smaller on large screens
        "max-md:hidden" // Hidden on mobile
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Meeting</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar Content */}
        {!isSidebarCollapsed && (
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="participants" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Participants</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="participants" className="flex-1 overflow-hidden">
                <ParticipantList
                  participants={participants}
                  currentUserId={currentUserId}
                  onMuteParticipant={(attendeeId) => {
                    // This will be handled by the Chime SDK integration
                    console.log('Mute participant:', attendeeId);
                  }}
                  onRemoveParticipant={(attendeeId) => {
                    // This will be handled by the Chime SDK integration
                    console.log('Remove participant:', attendeeId);
                  }}
                  onPromoteToCoHost={(attendeeId) => {
                    // This will be handled by the Chime SDK integration
                    console.log('Promote to co-host:', attendeeId);
                  }}
                  onDemoteFromCoHost={(attendeeId) => {
                    // This will be handled by the Chime SDK integration
                    console.log('Demote from co-host:', attendeeId);
                  }}
                  onMuteAll={() => {
                    // This will be handled by the Chime SDK integration
                    console.log('Mute all participants');
                  }}
                  onMuteAllExceptHost={() => {
                    // This will be handled by the Chime SDK integration
                    console.log('Mute all except host');
                  }}
                />
              </TabsContent>

              <TabsContent value="chat" className="flex-1 overflow-hidden">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Meeting Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
                      <div className="text-center text-gray-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                        <p>Chat feature coming soon!</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                      />
                      <Button size="sm" disabled>
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="flex-1 overflow-hidden">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Meeting Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Meeting Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Title:</span>
                          <span className="ml-2">{meeting.title}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Meeting ID:</span>
                          <span className="ml-2 font-mono">{meeting.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Host:</span>
                          <span className="ml-2">{meeting.host_id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Permissions</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={isHost ? "default" : "secondary"}>
                            {isHost ? "Host" : isCoHost ? "Co-Host" : "Participant"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          Copy Meeting Link
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          Export Participants
                        </Button>
                        {isHost && (
                          <Button variant="destructive" size="sm" className="w-full">
                            End Meeting for All
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Mobile Controls - Show on mobile when sidebar is hidden */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
        <div className="flex items-center justify-center gap-2 bg-black/50 rounded-full p-3 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className={cn(
              "rounded-full w-10 h-10 flex items-center justify-center",
              isMuted ? "bg-red-600 text-white" : "bg-gray-700 text-white"
            )}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleVideo}
            className={cn(
              "rounded-full w-10 h-10 flex items-center justify-center",
              !isVideoEnabled ? "bg-red-600 text-white" : "bg-gray-700 text-white"
            )}
          >
            {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeave}
            className="rounded-full bg-red-600 text-white w-10 h-10 flex items-center justify-center"
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Panel (when toggled) */}
      {showChat && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium">Meeting Chat</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 p-4">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2" />
              <p>Chat feature coming soon!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMeetingInterface;
