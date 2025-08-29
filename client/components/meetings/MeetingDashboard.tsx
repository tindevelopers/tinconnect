import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Video, Calendar, Clock, Users } from 'lucide-react';
import { Meeting } from '../../../server/lib/database.types';
import { CreateMeetingRequest } from '@shared/api';

interface MeetingDashboardProps {
  tenantId: string;
  onJoinMeeting: (meeting: Meeting) => void;
}

export const MeetingDashboard: React.FC<MeetingDashboardProps> = ({
  tenantId,
  onJoinMeeting,
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState<Partial<CreateMeetingRequest>>({
    title: '',
    description: '',
    host_id: '',
  });

  useEffect(() => {
    fetchMeetings();
  }, [tenantId]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tenants/${tenantId}/meetings`);
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.host_id) return;

    try {
      const response = await fetch(`/api/tenants/${tenantId}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMeeting,
          tenant_id: tenantId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMeetings([data.data, ...meetings]);
        setNewMeeting({ title: '', description: '', host_id: '' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meetings</h2>
          <p className="text-muted-foreground">
            Manage and join video meetings
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Meeting
        </Button>
      </div>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Meeting</CardTitle>
            <CardDescription>
              Schedule a new video meeting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingTitle">Title</Label>
                <Input
                  id="meetingTitle"
                  placeholder="Meeting title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meetingHost">Host ID</Label>
                <Input
                  id="meetingHost"
                  placeholder="Host user ID"
                  value={newMeeting.host_id}
                  onChange={(e) => setNewMeeting({ ...newMeeting, host_id: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meetingDescription">Description</Label>
              <Input
                id="meetingDescription"
                placeholder="Meeting description"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateMeeting}>
                Create Meeting
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meetings List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{meeting.title}</CardTitle>
                  <CardDescription>
                    {meeting.description || 'No description'}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(meeting.status)}>
                  {meeting.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(meeting.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime(meeting.created_at)}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>0 participants</span>
                </div>
                
                {meeting.status === 'active' && (
                  <Button 
                    size="sm" 
                    onClick={() => onJoinMeeting(meeting)}
                    className="flex items-center space-x-1"
                  >
                    <Video className="h-4 w-4" />
                    <span>Join</span>
                  </Button>
                )}
                
                {meeting.status === 'scheduled' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onJoinMeeting(meeting)}
                    className="flex items-center space-x-1"
                  >
                    <Video className="h-4 w-4" />
                    <span>Start</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meetings.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Meetings Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first meeting to get started with video conferencing.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Meeting
          </Button>
        </div>
      )}
    </div>
  );
};
