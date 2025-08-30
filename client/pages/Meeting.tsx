import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoMeeting } from '@/components/video/VideoMeeting';

interface MeetingInfo {
  meetingId: string;
  userName: string;
}

const Meeting: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
  const [joinMethod, setJoinMethod] = useState<string | null>(null);

  useEffect(() => {
    // Get meeting info from location state or session storage
    const stateInfo = location.state as MeetingInfo;
    const storedInfo = sessionStorage.getItem('pendingMeeting');
    const storedMethod = sessionStorage.getItem('joinMethod');
    
    if (stateInfo) {
      setMeetingInfo(stateInfo);
    } else if (storedInfo) {
      setMeetingInfo(JSON.parse(storedInfo));
    } else {
      // No meeting info available, redirect to join meeting
      navigate('/join-meeting');
      return;
    }
    
    if (storedMethod) {
      setJoinMethod(storedMethod);
    }
  }, [location.state, navigate]);

  const handleLeaveMeeting = () => {
    // Clean up session storage
    sessionStorage.removeItem('pendingMeeting');
    sessionStorage.removeItem('joinMethod');
    navigate('/welcome');
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

  // For now, we'll show a placeholder meeting interface
  // In a real app, this would integrate with the VideoMeeting component
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Meeting Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">TIN Connect Meeting</h1>
            <p className="text-sm text-gray-300">
              Meeting ID: {meetingInfo.meetingId} | Joined as: {meetingInfo.userName}
            </p>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleLeaveMeeting}
          >
            Leave Meeting
          </Button>
        </div>
      </header>

      {/* Meeting Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-center">Meeting In Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-100 rounded-lg p-12">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {meetingInfo.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-lg font-medium">{meetingInfo.userName}</p>
              <p className="text-sm text-gray-500">You</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-600">
                Meeting ID: <span className="font-mono">{meetingInfo.meetingId}</span>
              </p>
              {joinMethod && (
                <p className="text-sm text-gray-500">
                  Joined via: {joinMethod === 'browser' ? 'Browser' : joinMethod === 'desktop' ? 'Desktop App' : 'Mobile App'}
                </p>
              )}
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                This is a placeholder meeting interface. In a production app, this would show the actual video conferencing interface.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Meeting Controls */}
      <footer className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-center space-x-4">
          <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
            Mute
          </Button>
          <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
            Camera
          </Button>
          <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
            Share Screen
          </Button>
          <Button variant="destructive" onClick={handleLeaveMeeting}>
            End Meeting
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Meeting;
