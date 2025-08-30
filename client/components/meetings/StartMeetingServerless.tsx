import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Video, Users, Calendar, Clock, Settings, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';

// Serverless API configuration
const SERVERLESS_API_BASE = 'http://localhost:8082/api'; // Using our CORS proxy

interface StartMeetingServerlessProps {
  tenantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  onMeetingCreated: (meeting: any) => void;
  onMeetingJoined: (meeting: any, joinData: any) => void;
}

export const StartMeetingServerless: React.FC<StartMeetingServerlessProps> = ({
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
  const [newMeeting, setNewMeeting] = useState({
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
  const [joinMeetingTitle, setJoinMeetingTitle] = useState('');
  const [joinName, setJoinName] = useState(userName);

  // Meeting settings state
  const [showSettings, setShowSettings] = useState(false);

  const logMessage = (message: string) => {
    console.log(`[StartMeetingServerless] ${message}`);
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title) {
      setError('Meeting title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logMessage('Creating meeting with serverless backend...');
      logMessage(`Meeting data: ${JSON.stringify(newMeeting)}`);
      
      // Use the serverless join endpoint to create a meeting
      const response = await fetch(`${SERVERLESS_API_BASE}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMeeting.title,
          attendeeName: newMeeting.host_id
        }),
      });

      logMessage(`Response status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        logMessage('Meeting created successfully via serverless API');
        logMessage(`Join info: ${JSON.stringify(result)}`);
        
        // Create a meeting object that matches our expected format
        const meeting = {
          id: result.JoinInfo.Meeting.ExternalMeetingId,
          title: newMeeting.title,
          description: newMeeting.description,
          host_id: newMeeting.host_id,
          chime_meeting_id: result.JoinInfo.Meeting.MeetingId,
          joinInfo: result.JoinInfo
        };
        
        onMeetingCreated(meeting);
      } else {
        const errorText = await response.text();
        logMessage(`Meeting creation failed: ${response.status} - ${errorText}`);
        setError(`Failed to create meeting: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!joinMeetingTitle || !joinName) {
      setError('Meeting title and your name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logMessage('Joining meeting with serverless backend...');
      logMessage(`Join data: title=${joinMeetingTitle}, name=${joinName}`);
      
      const response = await fetch(`${SERVERLESS_API_BASE}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: joinMeetingTitle,
          attendeeName: joinName
        }),
      });

      logMessage(`Response status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        logMessage('Successfully joined meeting via serverless API');
        logMessage(`Join info: ${JSON.stringify(result)}`);
        
        // Create a meeting object that matches our expected format
        const meeting = {
          id: result.JoinInfo.Meeting.ExternalMeetingId,
          title: joinMeetingTitle,
          description: `Meeting joined by ${joinName}`,
          host_id: joinName,
          chime_meeting_id: result.JoinInfo.Meeting.MeetingId,
          joinInfo: result.JoinInfo
        };
        
        onMeetingJoined(meeting, result.JoinInfo);
      } else {
        const errorText = await response.text();
        logMessage(`Meeting join failed: ${response.status} - ${errorText}`);
        setError(`Failed to join meeting: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Meeting</h1>
        <p className="text-gray-600">Create a new meeting or join an existing one using our serverless backend</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'create'
              ? 'bg-white text-gray-900 shadow-sm'
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
              ? 'bg-white text-gray-900 shadow-sm'
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
            <CardTitle className="flex items-center">
              <Video className="w-5 h-5 mr-2" />
              Create New Meeting
            </CardTitle>
            <CardDescription>
              Start a new video meeting with your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                placeholder="Enter meeting title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                placeholder="Enter meeting description"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={newMeeting.host_id}
                onChange={(e) => setNewMeeting({ ...newMeeting, host_id: e.target.value })}
                placeholder="Host name"
                className="mt-1"
              />
            </div>

            {/* Meeting Settings */}
            <div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-4 h-4 mr-2" />
                Meeting Settings
              </button>
              
              {showSettings && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recording Enabled</span>
                    <Badge variant={newMeeting.settings.recordingEnabled ? 'default' : 'secondary'}>
                      {newMeeting.settings.recordingEnabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chat Enabled</span>
                    <Badge variant={newMeeting.settings.chatEnabled ? 'default' : 'secondary'}>
                      {newMeeting.settings.chatEnabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Screen Share Enabled</span>
                    <Badge variant={newMeeting.settings.screenShareEnabled ? 'default' : 'secondary'}>
                      {newMeeting.settings.screenShareEnabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Waiting Room</span>
                    <Badge variant={newMeeting.settings.waitingRoomEnabled ? 'default' : 'secondary'}>
                      {newMeeting.settings.waitingRoomEnabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateMeeting}
              disabled={loading || !newMeeting.title}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Meeting...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Create Meeting
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Join Meeting
            </CardTitle>
            <CardDescription>
              Join an existing meeting by entering the meeting title
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="joinTitle">Meeting Title *</Label>
              <Input
                id="joinTitle"
                value={joinMeetingTitle}
                onChange={(e) => setJoinMeetingTitle(e.target.value)}
                placeholder="Enter meeting title to join"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="joinName">Your Name *</Label>
              <Input
                id="joinName"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleJoinMeeting}
              disabled={loading || !joinMeetingTitle || !joinName}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining Meeting...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Join Meeting
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Serverless Backend Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>✅ Using AWS Lambda functions for meeting management</p>
            <p>✅ CORS proxy server handling API requests</p>
            <p>✅ Real-time video conferencing with Chime SDK</p>
            <p>✅ Scalable serverless architecture</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
