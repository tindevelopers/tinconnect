import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const JoinMeeting: React.FC = () => {
  const [meetingId, setMeetingId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingId.trim() && userName.trim()) {
      // Store the meeting info and navigate to join options
      sessionStorage.setItem(
        "pendingMeeting",
        JSON.stringify({
          meetingId: meetingId.trim(),
          userName: userName.trim(),
        }),
      );
      navigate("/join-options");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              TIN Connect
            </h1>
          </div>

          {/* Welcome Message */}
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl font-medium text-blue-600">
              Welcome to TIN Connect!
            </h2>
            <p className="text-xl text-gray-500 max-w-lg mx-auto">
              Easily connect with your friends, family and co-workers.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meeting ID Field */}
            <div className="space-y-2">
              <Label
                htmlFor="meetingId"
                className="text-left block text-xl text-blue-600 font-medium"
              >
                Meeting ID
              </Label>
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <Input
                    id="meetingId"
                    type="text"
                    placeholder="214-578"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    className="text-xl text-gray-500 border-0 focus-visible:ring-0 p-0"
                    required
                  />
                </CardContent>
              </Card>
            </div>

            {/* User Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="userName"
                className="text-left block text-xl text-blue-600 font-medium"
              >
                Your name
              </Label>
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <Input
                    id="userName"
                    type="text"
                    placeholder="John Doe"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-xl text-gray-500 border-0 focus-visible:ring-0 p-0"
                    required
                  />
                </CardContent>
              </Card>
            </div>

            {/* Continue Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium rounded-2xl"
                size="lg"
              >
                Continue
              </Button>
            </div>
          </form>

          {/* Additional Links */}
          <div className="mt-8 space-y-2">
            <div>
              <Link
                to="/auth?forgot=true"
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Forgot your password?
              </Link>
            </div>
            <div>
              <p className="text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/auth?mode=signup"
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  Sign up for free.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Available for download:</p>
          <div className="flex justify-center items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded px-4 py-2 text-sm text-gray-600">
              App Store
            </div>
            <div className="h-10 bg-gray-200 rounded px-4 py-2 text-sm text-gray-600">
              Google Play
            </div>
            <div className="h-10 bg-gray-200 rounded px-4 py-2 text-sm text-gray-600">
              Windows Store
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JoinMeeting;
