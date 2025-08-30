import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StartMeetingServerless } from '../components/meetings/StartMeetingServerless';
import EnhancedMeetingInterface from '../components/meetings/EnhancedMeetingInterface';
import { ParticipantProvider } from '../contexts/ParticipantContext';
import { Meeting } from '@shared/api';

export default function StartMeetingPage() {
  const { user, userProfile, tenant } = useAuth();
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [joinData, setJoinData] = useState<any>(null);
  const [isInMeeting, setIsInMeeting] = useState(false);

  const handleMeetingCreated = (meeting: Meeting) => {
    console.log('StartMeetingPage: Meeting created:', meeting);
    console.log('StartMeetingPage: Setting current meeting and isInMeeting to true');
    setCurrentMeeting(meeting);
    setIsInMeeting(true);
  };

  const handleMeetingJoined = (meeting: Meeting, joinData: any) => {
    console.log('Meeting joined:', meeting, joinData);
    setCurrentMeeting(meeting);
    setJoinData(joinData);
    setIsInMeeting(true);
  };

  const handleLeaveMeeting = () => {
    setIsInMeeting(false);
    setCurrentMeeting(null);
    setJoinData(null);
  };

  // Debug logging
  console.log('StartMeetingPage - User:', user);
  console.log('StartMeetingPage - Tenant:', tenant);
  console.log('StartMeetingPage - UserProfile:', userProfile);

  // If user is not authenticated, redirect to auth with return URL
  if (!user) {
    const currentPath = window.location.pathname;
    window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`;
    return null;
  }

  // If user is authenticated but tenant is still loading, show loading
  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600 mb-4">Please wait while we load your account information.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // If currently in a meeting, show the enhanced meeting interface
  if (isInMeeting && currentMeeting) {
    console.log('StartMeetingPage: Rendering EnhancedMeetingInterface with meeting:', currentMeeting);
    return (
      <ParticipantProvider 
        meetingSession={null} 
        currentUserId={user.id}
      >
        <EnhancedMeetingInterface
          meeting={currentMeeting}
          currentUserId={user.id}
          onLeave={handleLeaveMeeting}
        />
      </ParticipantProvider>
    );
  }

  // Show the start meeting interface
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start or Join a Meeting</h1>
          <p className="text-gray-600">Create a new meeting or join an existing one</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Meeting */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Meeting</h2>
            <p className="text-gray-600 mb-4">
              Start a new video conference meeting. You'll be the host and can invite others to join.
            </p>
            <StartMeetingServerless
              tenantId={tenant.id}
              userId={user.id}
              userName={userProfile?.name || user.email || 'User'}
              userEmail={user.email || ''}
              onMeetingCreated={handleMeetingCreated}
              onMeetingJoined={handleMeetingJoined}
            />
          </div>

          {/* Quick Access */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Demo Meeting</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Try the enhanced meeting interface with demo features
                </p>
                <button
                  onClick={() => {
                    const demoMeeting: Meeting = {
                      id: 'demo-meeting-123',
                      title: 'Demo Meeting',
                      description: 'Enhanced meeting interface demonstration',
                      host_id: user.id,
                      tenant_id: tenant.id,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    };
                    setCurrentMeeting(demoMeeting);
                    setIsInMeeting(true);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Demo Meeting
                </button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Join by Meeting ID</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Enter a meeting ID to join an existing meeting
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter meeting ID..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="meeting-id-input"
                  />
                  <button
                    onClick={() => {
                      const meetingId = (document.getElementById('meeting-id-input') as HTMLInputElement)?.value;
                      if (meetingId) {
                        const joinMeeting: Meeting = {
                          id: meetingId,
                          title: `Meeting ${meetingId}`,
                          description: 'Joining existing meeting',
                          host_id: 'unknown-host',
                          tenant_id: tenant.id,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        };
                        setCurrentMeeting(joinMeeting);
                        setIsInMeeting(true);
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Meeting Information</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Your Name:</strong> {userProfile?.name || user.email}</p>
            <p><strong>Your Email:</strong> {user.email}</p>
            <p><strong>Tenant:</strong> {tenant.name}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">How to Use</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Create New Meeting:</strong> Click "Create Meeting" to start a new video conference. You'll be the host.</p>
            <p><strong>Demo Meeting:</strong> Try the enhanced interface with demo features and sample participants.</p>
            <p><strong>Join Meeting:</strong> Enter a meeting ID to join an existing meeting (if you have the ID).</p>
            <p><strong>Meeting Features:</strong> Once in a meeting, you can manage participants, use chat, and access settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
