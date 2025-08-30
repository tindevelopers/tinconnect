import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Plus,
  Video,
  Calendar,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";
import { Meeting } from "../../../server/lib/database.types";
import { CreateMeetingRequest } from "@shared/api";
import { MeetingTable } from "./MeetingTable";

interface EnhancedMeetingDashboardProps {
  tenantId: string;
  onJoinMeeting: (meeting: Meeting) => void;
}

export const EnhancedMeetingDashboard: React.FC<
  EnhancedMeetingDashboardProps
> = ({ tenantId, onJoinMeeting }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState<Partial<CreateMeetingRequest>>({
    title: "",
    description: "",
    host_id: "",
  });

  useEffect(() => {
    fetchMeetings();
  }, [tenantId]);

  const fetchMeetings = async () => {
    if (!tenantId) {
      console.log("No tenantId available, skipping meeting fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching meetings for tenant: ${tenantId}`);
      const response = await fetch(`/api/tenants/${tenantId}/meetings`);

      if (response.ok) {
        const data = await response.json();
        console.log("Meetings fetched successfully:", data);
        setMeetings(data.data || []);
      } else {
        console.error(`Failed to fetch meetings: ${response.status} ${response.statusText}`);
        const errorData = await response.text();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      // Set empty array so UI doesn't break
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.host_id) {
      console.error("Missing required fields for meeting creation");
      return;
    }

    if (!tenantId) {
      console.error("No tenant ID available for meeting creation");
      return;
    }

    try {
      console.log("Creating meeting:", { tenantId, newMeeting });
      const response = await fetch(`/api/tenants/${tenantId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMeeting,
          tenant_id: tenantId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Meeting created successfully:", data);
        setMeetings([data.data, ...meetings]);
        setNewMeeting({ title: "", description: "", host_id: "" });
        setShowCreateForm(false);
      } else {
        const errorData = await response.text();
        console.error(`Failed to create meeting: ${response.status}`, errorData);
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const handleEditMeeting = (meeting: Meeting) => {
    // Implement edit functionality
    console.log("Edit meeting:", meeting);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Meeting Form */}
      {showCreateForm && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-blue-600" />
              <span>Create New Meeting</span>
            </CardTitle>
            <CardDescription>
              Schedule a new video meeting for your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingTitle">Meeting Title</Label>
                <Input
                  id="meetingTitle"
                  placeholder="Enter meeting title"
                  value={newMeeting.title}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="meetingHost">Host ID</Label>
                <Input
                  id="meetingHost"
                  placeholder="Host user ID"
                  value={newMeeting.host_id}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, host_id: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meetingDescription">Description (Optional)</Label>
              <Input
                id="meetingDescription"
                placeholder="Meeting description"
                value={newMeeting.description}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, description: e.target.value })
                }
              />
            </div>
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleCreateMeeting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Meeting
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meeting Table */}
      {meetings.length > 0 ? (
        <MeetingTable
          meetings={meetings}
          onJoinMeeting={onJoinMeeting}
          onEditMeeting={handleEditMeeting}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Video className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Meetings Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first meeting to get started with video conferencing and
            collaboration.
          </p>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Meeting
          </Button>
        </div>
      )}

      {/* Chat Indicator */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full bg-teal-500 hover:bg-teal-600 shadow-lg h-14 w-14 p-0"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
