
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import SignIn from "./pages/SignIn";
import JoinMeeting from "./pages/JoinMeeting";
import JoinOptions from "./pages/JoinOptions";
import Meeting from "./pages/Meeting";
import Dashboard from "./pages/Dashboard";
import ImprovedDashboard from "./pages/ImprovedDashboard";
import EnhancedMeeting from "./pages/EnhancedMeeting";
import NotFound from "./pages/NotFound";

import "./global.css";

// Debug logging
console.log("App.tsx is loading...");

// Create a client
const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  console.log(
    "ProtectedRoute component rendered, user:",
    user,
    "loading:",
    loading,
  );

  if (loading) {
    console.log("ProtectedRoute: showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  console.log("ProtectedRoute: rendering children");
  return <>{children}</>;
};

function AppRoutes() {
  console.log("AppRoutes component rendering...");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/join-meeting" element={<JoinMeeting />} />
        <Route path="/join-options" element={<JoinOptions />} />
        <Route path="/meeting" element={<Meeting />} />
        <Route path="/enhanced-meeting" element={<EnhancedMeeting />} />
        <Route
          path="/dashboard"

          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/improved-dashboard" element={<ImprovedDashboard />} />
        {/* Redirect capitalized versions to correct routes */}
        <Route
          path="/ImprovedDashboard"
          element={<Navigate to="/improved-dashboard" replace />}
        />
        <Route
          path="/EnhancedMeeting"
          element={<Navigate to="/enhanced-meeting" replace />}
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  console.log("App component rendering...");

  try {
    console.log("App: Creating QueryClientProvider...");
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("App: Error rendering app:", error);
    return <div>Error loading app: {error.message}</div>;
  }
}
