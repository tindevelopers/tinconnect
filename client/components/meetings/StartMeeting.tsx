import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Video, Users, Calendar, Clock, Settings, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';
import { CreateMeetingRequest, JoinMeetingRequest, Meeting } from '@shared/api';

interface StartMeetingProps {
  tenantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  onMeetingCreated: (meeting: Meeting) => void;
  onMeetingJoined: (meeting: Meeting, joinData: any) => void;
}

export const StartMeeting: React.FC<StartMeetingProps> = ({
  tenantId,
  userId,
  userName,
  userEmail,
  onMeetingCreated,
  onMeetingJoined,
}) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create meeting form state
  const [newMeeting, setNewMeeting] = useState<Partial<CreateMeetingRequest>>({
    title: '',
    description: '',
    host_id: userId,
    settings: {
      recordingEnabled: true,
      chatEnabled: true,
      screenShareEnabled: true,
      waitingRoomEnabled: false,
    },
  });

  // Join meeting form state
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [joinName, setJoinName] = useState(userName);
  const [joinEmail, setJoinEmail] = useState(userEmail);

  // Meeting settings state
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateMeeting = async () => {
    if (!newMeeting.title) {
      setError('Meeting title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating meeting with data:', {
        ...newMeeting,
        tenant_id: tenantId,
      });
      console.log('Making API call to:', `/api/tenants/${tenantId}/meetings`);
      
      const response = await fetch(`/api/tenants/${tenantId}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMeeting,
          tenant_id: tenantId,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('Meeting creation result:', result);
        if (result.success) {
          console.log('Meeting created successfully, calling onMeetingCreated');
          onMeetingCreated(result.data);
        } else {
          console.error('Meeting creation failed:', result.error);
          setError(result.error || 'Failed to create meeting');
        }
      } else {
        const errorData = await response.json();
        console.error('Meeting creation HTTP error:', errorData);
        setError(errorData.error || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!joinMeetingId || !joinName || !joinEmail) {
      setError('Meeting ID, name, and email are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tenants/${tenantId}/meetings/${joinMeetingId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: joinName,
          email: joinEmail,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onMeetingJoined(result.data.meeting, result.data);
        } else {
          setError(result.error || 'Failed to join meeting');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to join meeting');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateMeetingSetting = (key: keyof typeof newMeeting.settings, value: boolean) => {
    setNewMeeting(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Meeting</h1>
        <p className="text-gray-600">Create a new video meeting or join an existing one</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'create'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Video className="w-4 h-4 inline mr-2" />
          Create Meeting
        </button>
        <button
          onClick={() => setMode('join')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'join'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Join Meeting
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {mode === 'create' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Create New Meeting
            </CardTitle>
            <CardDescription>
              Start a new video meeting with AWS Chime SDK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingTitle">Meeting Title *</Label>
                <Input
                  id="meetingTitle"
                  placeholder="Enter meeting title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meetingDescription">Description</Label>
                <Input
                  id="meetingDescription"
                  placeholder="Optional meeting description"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                />
              </div>
            </div>

            {/* Meeting Settings */}
            <div>
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Meeting Settings
              </Button>
              
              {showSettings && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="recordingEnabled">Recording Enabled</Label>
                    <Button
                      variant={newMeeting.settings?.recordingEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateMeetingSetting('recordingEnabled', !newMeeting.settings?.recordingEnabled)}
                    >
                      {newMeeting.settings?.recordingEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="chatEnabled">Chat Enabled</Label>
                    <Button
                      variant={newMeeting.settings?.chatEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateMeetingSetting('chatEnabled', !newMeeting.settings?.chatEnabled)}
                    >
                      {newMeeting.settings?.chatEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="screenShareEnabled">Screen Sharing</Label>
                    <Button
                      variant={newMeeting.settings?.screenShareEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateMeetingSetting('screenShareEnabled', !newMeeting.settings?.screenShareEnabled)}
                    >
                      {newMeeting.settings?.screenShareEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="waitingRoomEnabled">Waiting Room</Label>
                    <Button
                      variant={newMeeting.settings?.waitingRoomEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateMeetingSetting('waitingRoomEnabled', !newMeeting.settings?.waitingRoomEnabled)}
                    >
                      {newMeeting.settings?.waitingRoomEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleCreateMeeting} 
                disabled={loading || !newMeeting.title}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Create Meeting
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Join Meeting
            </CardTitle>
            <CardDescription>
              Join an existing video meeting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="meetingId">Meeting ID *</Label>
              <Input
                id="meetingId"
                placeholder="Enter meeting ID"
                value={joinMeetingId}
                onChange={(e) => setJoinMeetingId(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="joinName">Your Name *</Label>
                <Input
                  id="joinName"
                  placeholder="Enter your name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="joinEmail">Your Email *</Label>
                <Input
                  id="joinEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={joinEmail}
                  onChange={(e) => setJoinEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleJoinMeeting} 
                disabled={loading || !joinMeetingId || !joinName || !joinEmail}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Join Meeting
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AWS Chime SDK Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">Powered by AWS Chime SDK</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Badge variant="outline">AWS Chime SDK</Badge>
            <Badge variant="outline">Real-time Video</Badge>
            <Badge variant="outline">Screen Sharing</Badge>
            <Badge variant="outline">Chat</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
