import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ParticipantProvider } from './contexts/ParticipantContext';
import { Toaster } from './components/ui/sonner';

// Import pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import EnhancedDashboard from './pages/EnhancedDashboard';
import StartMeeting from './pages/StartMeeting';
import MeetingPage from './pages/MeetingPage';
import ChimeTest from './pages/ChimeTest';
import VideoMeetingPage from './pages/VideoMeetingPage';
import ImprovedDashboard from './pages/ImprovedDashboard';
import EnhancedMeeting from './pages/EnhancedMeeting';
import EnhancedMeetingDemo from './pages/EnhancedMeetingDemo';

// Import components
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import VideoMeetingInterface from './pages/VideoMeetingInterface';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ParticipantProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/enhanced-dashboard" 
                element={
                  <ProtectedRoute>
                    <EnhancedDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/improved-dashboard" 
                element={
                  <ProtectedRoute>
                    <ImprovedDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/start-meeting" 
                element={
                  <ProtectedRoute>
                    <StartMeeting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/meeting/:meetingId" 
                element={
                  <ProtectedRoute>
                    <MeetingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/video-meeting/:meetingId" 
                element={
                  <ProtectedRoute>
                    <VideoMeetingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/video-meeting-interface/:meetingId" 
                element={
                  <ProtectedRoute>
                    <VideoMeetingInterface />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/enhanced-meeting/:meetingId" 
                element={
                  <ProtectedRoute>
                    <EnhancedMeeting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/enhanced-meeting-demo" 
                element={
                  <ProtectedRoute>
                    <EnhancedMeetingDemo />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chime-test" 
                element={
                  <ProtectedRoute>
                    <ChimeTest />
                  </ProtectedRoute>
                } 
              />

              {/* Redirect /dashboard to /enhanced-dashboard for new experience */}
              <Route path="/main" element={<Navigate to="/enhanced-dashboard" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </ParticipantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
