import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import EnhancedMeetingInterface from '../components/meetings/EnhancedMeetingInterface';
import { ParticipantProvider } from '../contexts/ParticipantContext';

const EnhancedMeetingDemo: React.FC = () => {
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [meetingConfig, setMeetingConfig] = useState({
    title: 'Demo Meeting',
    description: 'Enhanced meeting interface demonstration',
    host_id: 'demo-host-123',
    id: 'demo-meeting-456'
  });
  const [currentUserId, setCurrentUserId] = useState('demo-user-789');

  const handleStartMeeting = () => {
    setIsInMeeting(true);
  };

  const handleLeaveMeeting = () => {
    setIsInMeeting(false);
  };

  if (isInMeeting) {
    return (
      <ParticipantProvider 
        meetingSession={null} 
        currentUserId={currentUserId}
      >
        <EnhancedMeetingInterface
          meeting={meetingConfig}
          currentUserId={currentUserId}
          onLeave={handleLeaveMeeting}
        />
      </ParticipantProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Enhanced Meeting Interface Demo
              <Badge variant="secondary">Chime SDK Integration</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meeting-title">Meeting Title</Label>
                  <Input
                    id="meeting-title"
                    value={meetingConfig.title}
                    onChange={(e) => setMeetingConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter meeting title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="meeting-description">Description</Label>
                  <Input
                    id="meeting-description"
                    value={meetingConfig.description}
                    onChange={(e) => setMeetingConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter meeting description"
                  />
                </div>
                
                <div>
                  <Label htmlFor="host-id">Host ID</Label>
                  <Input
                    id="host-id"
                    value={meetingConfig.host_id}
                    onChange={(e) => setMeetingConfig(prev => ({ ...prev, host_id: e.target.value }))}
                    placeholder="Enter host ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="meeting-id">Meeting ID</Label>
                  <Input
                    id="meeting-id"
                    value={meetingConfig.id}
                    onChange={(e) => setMeetingConfig(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="Enter meeting ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="user-id">Your User ID</Label>
                  <Input
                    id="user-id"
                    value={currentUserId}
                    onChange={(e) => setCurrentUserId(e.target.value)}
                    placeholder="Enter your user ID"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Features Included:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Real-time Chime SDK integration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Enhanced participant management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Role-based permissions (Host/Co-Host/Participant)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Speaking detection and audio indicators
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Connection quality monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Video/audio controls
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Screen sharing (UI ready)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Meeting recording (UI ready)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Chat interface (UI ready)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Fullscreen mode
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Collapsible sidebar
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Chime SDK Events:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Attendee presence (join/leave)</li>
                    <li>• Audio level monitoring</li>
                    <li>• Mute/unmute state changes</li>
                    <li>• Video on/off state changes</li>
                    <li>• Connection health monitoring</li>
                    <li>• Real-time participant updates</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleStartMeeting}
                className="flex-1"
                size="lg"
              >
                Start Enhanced Meeting Demo
              </Button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Demo Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Configure the meeting settings above</li>
                <li>• Click "Start Enhanced Meeting Demo" to enter the meeting interface</li>
                <li>• Explore the participant management features in the sidebar</li>
                <li>• Test the video/audio controls and fullscreen mode</li>
                <li>• Try the collapsible sidebar and different tabs</li>
                <li>• Use the "Leave" button to return to this setup screen</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedMeetingDemo;
