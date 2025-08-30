import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StartMeeting } from '../components/meetings/StartMeeting';
import { ChimeVideoMeeting } from '../components/video/ChimeVideoMeeting';
import { ChimeSDKMeeting } from '../components/video/ChimeSDKMeeting';
import { Meeting } from '@shared/api';

export default function StartMeetingPage() {
  const { user, userProfile, tenant } = useAuth();
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [joinData, setJoinData] = useState<any>(null);
  const [isInMeeting, setIsInMeeting] = useState(false);

  const handleMeetingCreated = (meeting: Meeting) => {
    console.log('Meeting created:', meeting);
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

  // If user is not authenticated, show login prompt
  if (!user || !tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to start or join meetings.</p>
          <a
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // If currently in a meeting, show the video meeting interface
  if (isInMeeting && currentMeeting) {
    return (
      <ChimeSDKMeeting
        meeting={currentMeeting}
        joinData={joinData}
        onLeave={handleLeaveMeeting}
      />
    );
  }

  // Show the start meeting interface
  return (
    <StartMeeting
      tenantId={tenant.id}
      userId={user.id}
      userName={userProfile?.name || user.email || 'User'}
      userEmail={user.email || ''}
      onMeetingCreated={handleMeetingCreated}
      onMeetingJoined={handleMeetingJoined}
    />
  );
}
