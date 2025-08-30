import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Home, 
  Video, 
  Users, 
  Calendar, 
  Bell, 
  Settings,
  LogOut,
  Plus,
  MessageSquare,
  Mic,
  VideoIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

// Mock data for demonstration
const mockUpcomingMeeting = {
  id: '1',
  title: 'Monthly Meetup',
  startTime: 'Starting in 2 minutes',
  participants: [
    { id: '1', name: 'Alex', avatar: '/api/placeholder/60/60' },
    { id: '2', name: 'Sam', avatar: '/api/placeholder/60/60' },
    { id: '3', name: 'Jordan', avatar: '/api/placeholder/60/60' },
    { id: '4', name: '+3 more', isMore: true }
  ]
};

export default function ImprovedDashboard() {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleStartMeeting = () => {
    // Create a new meeting session
    const newMeeting = {
      meetingId: Math.random().toString(36).substr(2, 6).toUpperCase(),
      userName: userProfile?.name || user?.email || 'User'
    };
    
    sessionStorage.setItem('pendingMeeting', JSON.stringify(newMeeting));
    navigate('/enhanced-meeting', { state: newMeeting });
  };

  const handleJoinMeeting = () => {
    navigate('/join-meeting');
  };

  const handleJoinUpcomingMeeting = () => {
    const meetingInfo = {
      meetingId: '214578',
      userName: userProfile?.name || user?.email || 'User'
    };
    
    sessionStorage.setItem('pendingMeeting', JSON.stringify(meetingInfo));
    navigate('/enhanced-meeting', { state: meetingInfo });
  };

  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'video', icon: Video, label: 'Meetings' },
    { id: 'users', icon: Users, label: 'Contacts' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-32 bg-white border-r border-gray-200 flex lg:flex-col flex-row items-center justify-around lg:justify-start py-6 lg:space-y-4 space-x-4 lg:space-x-0">
        {/* Logo */}
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center lg:mb-8 mb-0">
          <div className="w-8 h-8 bg-white rounded-lg"></div>
        </div>

        {/* Navigation */}
        <nav className="flex lg:flex-col flex-row lg:space-y-4 space-x-4 lg:space-x-0 flex-1 lg:justify-start justify-center">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                activeSection === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </nav>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {/* User Profile Section */}
          <div className="flex flex-col items-center mb-6 lg:mb-8">
            <div className="relative mb-4">
              <Avatar className="w-40 h-40 lg:w-60 lg:h-60 rounded-2xl">
                <AvatarImage 
                  src={userProfile?.avatar_url || '/api/placeholder/240/240'} 
                  alt={userProfile?.name || 'User'} 
                />
                <AvatarFallback className="text-4xl bg-blue-100 text-blue-600 rounded-2xl">
                  {userProfile?.name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-4 right-4 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-gray-500" />
              </div>
            </div>

            <h1 className="text-3xl font-medium text-blue-600 mb-2">
              {userProfile?.name || 'Erica James'}
            </h1>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-teal-500 rounded-full border-2 border-white"></div>
              <span className="text-xl text-gray-500">Available</span>
            </div>
          </div>

          {/* Meeting Controls */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <Button
              onClick={handleStartMeeting}
              className="w-full max-w-md h-16 bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium rounded-2xl flex items-center justify-center space-x-3"
            >
              <VideoIcon className="w-6 h-6" />
              <span>START A MEETING</span>
            </Button>

            <Button
              onClick={handleJoinMeeting}
              className="w-full max-w-md h-16 bg-teal-500 hover:bg-teal-600 text-white text-xl font-medium rounded-2xl flex items-center justify-center space-x-3"
            >
              <Plus className="w-6 h-6" />
              <span>JOIN A MEETING</span>
            </Button>
          </div>

          {/* Upcoming Meetings */}
          <div className="text-center mb-4">
            <h2 className="text-xl text-gray-500 font-medium">Upcoming meetings</h2>
          </div>

          {/* Meeting Card */}
          <Card className="max-w-md mx-auto shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-medium text-blue-600 mb-1">
                  {mockUpcomingMeeting.title}
                </h3>
                <p className="text-base text-teal-500 font-medium">
                  {mockUpcomingMeeting.startTime}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                  {mockUpcomingMeeting.participants.map((participant) => (
                    <div key={participant.id} className="relative">
                      {participant.isMore ? (
                        <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center text-white font-medium shadow-lg border-2 border-white">
                          +3
                        </div>
                      ) : (
                        <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleJoinUpcomingMeeting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-medium"
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-96 bg-gray-50 border-l border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button className="p-3 bg-white rounded-2xl shadow-sm">
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
        <div className="space-y-4 mb-6">
          {/* Incoming Message */}
          <div className="flex items-start space-x-3">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/api/placeholder/64/64" alt="Madison" />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="text-blue-600 font-medium text-lg mb-1">Madison</div>
                <div className="text-gray-500 text-xl">Hey, is it Lou's b-day next week?</div>
              </div>
              <div className="text-sm text-gray-400 mt-1">3:39 PM</div>
            </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex justify-end">
            <div className="max-w-sm">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 shadow-sm">
                <div className="text-white font-medium text-lg mb-1">Almost forgot! 😊</div>
                <div className="text-white text-xl">Been quite busy, damn.</div>
              </div>
              <div className="text-sm text-gray-400 mt-1 text-right">3:40 PM</div>
            </div>
          </div>

          {/* Another Incoming Message */}
          <div className="flex items-start space-x-3">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/api/placeholder/64/64" alt="Madison" />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="text-blue-600 font-medium text-lg mb-1">Madison</div>
                <div className="text-gray-500 text-xl">Haha that's okay, we all know about it.</div>
              </div>
              <div className="text-sm text-gray-400 mt-1">3:42 PM</div>
            </div>
          </div>
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
              className="flex-1 text-xl text-gray-500 bg-transparent border-none outline-none"
            />
            <button className="text-gray-400">
              <svg className="w-7 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <Button className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-2xl p-0">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
