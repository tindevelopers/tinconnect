import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ParticipantProvider } from "./contexts/ParticipantContext";
import { Toaster } from "./components/ui/sonner";

// Import pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import StartMeetingPage from "./pages/StartMeetingPage";
import Meeting from "./pages/Meeting";
import ChimeTest from "./pages/ChimeTest";
import ImprovedDashboard from "./pages/ImprovedDashboard";
import EnhancedMeeting from "./pages/EnhancedMeeting";
import EnhancedMeetingDemo from "./pages/EnhancedMeetingDemo";
import Welcome from "./pages/Welcome";
import JoinMeeting from "./pages/JoinMeeting";

// Import components
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";

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
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/join-meeting" element={<JoinMeeting />} />

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
                    <StartMeetingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meeting/:meetingId"
                element={
                  <ProtectedRoute>
                    <Meeting />
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

              {/* Redirect /main to /enhanced-dashboard for new experience */}
              <Route
                path="/main"
                element={<Navigate to="/enhanced-dashboard" replace />}
              />

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
