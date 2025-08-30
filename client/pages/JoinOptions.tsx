import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Globe, Smartphone } from "lucide-react";

interface MeetingInfo {
  meetingId: string;
  userName: string;
}

const JoinOptions: React.FC = () => {
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("pendingMeeting");
    if (stored) {
      setMeetingInfo(JSON.parse(stored));
    } else {
      // Redirect back to join meeting if no pending meeting
      navigate("/join-meeting");
    }
  }, [navigate]);

  const handleJoinOption = (option: "desktop" | "browser" | "app") => {
    if (!meetingInfo) return;

    // Store the join method and proceed to meeting
    sessionStorage.setItem("joinMethod", option);

    switch (option) {
      case "browser":
        navigate("/meeting", { state: meetingInfo });
        break;
      case "desktop":
        // For now, just navigate to meeting - in real app this would trigger download
        alert("Desktop app download would start here");
        navigate("/meeting", { state: meetingInfo });
        break;
      case "app":
        // For now, just navigate to meeting - in real app this would open mobile app
        alert("Mobile app would open here");
        navigate("/meeting", { state: meetingInfo });
        break;
    }
  };

  if (!meetingInfo) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 text-center">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              TIN Connect
            </h1>
          </div>

          {/* Question */}
          <div className="mb-12">
            <h2 className="text-3xl font-medium text-blue-600">
              How do you want to join your TIN Connect meeting?
            </h2>
          </div>

          {/* Join Options */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Desktop App Option */}
            <Card
              className="shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleJoinOption("desktop")}
            >
              <CardContent className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Monitor className="w-10 h-10 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl font-medium text-gray-700 mb-2">
                      Download the Desktop App
                    </h3>
                    <p className="text-lg text-gray-500">
                      Use the desktop app for a better experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browser Option */}
            <Card
              className="shadow-lg cursor-pointer hover:shadow-xl transition-shadow border-2 border-blue-200"
              onClick={() => handleJoinOption("browser")}
            >
              <CardContent className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Globe className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl font-medium text-blue-600 mb-2">
                      Continue in the browser
                    </h3>
                    <p className="text-lg text-gray-500">
                      You don't need to install anything, just from the browser
                      directly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile App Option */}
            <Card
              className="shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleJoinOption("app")}
            >
              <CardContent className="p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Smartphone className="w-10 h-10 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl font-medium text-gray-700 mb-2">
                      Continue in the App
                    </h3>
                    <p className="text-lg text-gray-500">
                      You already have the TIN Connect app? Have your meeting
                      there.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinOptions;
