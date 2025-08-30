import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StartMeetingServerless } from '../components/meetings/StartMeetingServerless';
import { ChimeVideoMeeting } from '../components/video/ChimeVideoMeeting';
import ChimeSDKServerless from '../components/video/ChimeSDKServerless';
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

  // If currently in a meeting, show the video meeting interface
  if (isInMeeting && currentMeeting) {
    console.log('StartMeetingPage: Rendering ChimeSDKMeeting with meeting:', currentMeeting);
    return (
      <ChimeSDKServerless
        meeting={currentMeeting}
        onLeave={handleLeaveMeeting}
      />
    );
  }

  // Show the start meeting interface
  return (
            <StartMeetingServerless
      tenantId={tenant.id}
      userId={user.id}
      userName={userProfile?.name || user.email || 'User'}
      userEmail={user.email || ''}
      onMeetingCreated={handleMeetingCreated}
      onMeetingJoined={handleMeetingJoined}
    />
  );
}
