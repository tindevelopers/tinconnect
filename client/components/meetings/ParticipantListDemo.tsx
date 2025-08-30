import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import ParticipantList, { Participant } from './ParticipantList';
import { ParticipantProvider } from '../../contexts/ParticipantContext';

const ParticipantListDemo: React.FC = () => {
  const [currentUserId] = useState('current-user-123');
  const [demoParticipants, setDemoParticipants] = useState<Participant[]>([
    {
      attendeeId: 'current-user-123',
      externalUserId: 'current-user-123',
      name: 'John Doe',
      role: 'host',
      status: 'connected',
      audio: 'speaking',
      video: 'on',
      isLocal: true,
      joinTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      connectionQuality: 'excellent',
      permissions: {
        canMuteOthers: true,
        canRemoveOthers: true,
        canPromoteToHost: true,
        canRecord: true,
        canShareScreen: true,
      },
    },
    {
      attendeeId: 'user-456',
      externalUserId: 'user-456',
      name: 'Jane Smith',
      role: 'co-host',
      status: 'connected',
      audio: 'muted',
      video: 'on',
      isLocal: false,
      joinTime: new Date(Date.now() - 32 * 60 * 1000), // 32 minutes ago
      connectionQuality: 'good',
      permissions: {
        canMuteOthers: true,
        canRemoveOthers: true,
        canPromoteToHost: false,
        canRecord: true,
        canShareScreen: true,
      },
    },
    {
      attendeeId: 'user-789',
      externalUserId: 'user-789',
      name: 'Bob Wilson',
      role: 'participant',
      status: 'connected',
      audio: 'unmuted',
      video: 'off',
      isLocal: false,
      joinTime: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      connectionQuality: 'poor',
      permissions: {
        canMuteOthers: false,
        canRemoveOthers: false,
        canPromoteToHost: false,
        canRecord: false,
        canShareScreen: true,
      },
    },
    {
      attendeeId: 'user-101',
      externalUserId: 'user-101',
      name: 'Alice Brown',
      role: 'participant',
      status: 'connecting',
      audio: 'unmuted',
      video: 'on',
      isLocal: false,
      joinTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      connectionQuality: 'fair',
      permissions: {
        canMuteOthers: false,
        canRemoveOthers: false,
        canPromoteToHost: false,
        canRecord: false,
        canShareScreen: true,
      },
    },
  ]);

  const handleMuteParticipant = (attendeeId: string) => {
    setDemoParticipants(prev => 
      prev.map(p => 
        p.attendeeId === attendeeId 
          ? { ...p, audio: p.audio === 'muted' ? 'unmuted' : 'muted' }
          : p
      )
    );
  };

  const handleRemoveParticipant = (attendeeId: string) => {
    setDemoParticipants(prev => prev.filter(p => p.attendeeId !== attendeeId));
  };

  const handlePromoteToCoHost = (attendeeId: string) => {
    setDemoParticipants(prev => 
      prev.map(p => 
        p.attendeeId === attendeeId 
          ? { 
              ...p, 
              role: 'co-host',
              permissions: {
                ...p.permissions,
                canMuteOthers: true,
                canRemoveOthers: true,
                canPromoteToHost: false,
                canRecord: true,
              }
            }
          : p
      )
    );
  };

  const handleDemoteFromCoHost = (attendeeId: string) => {
    setDemoParticipants(prev => 
      prev.map(p => 
        p.attendeeId === attendeeId 
          ? { 
              ...p, 
              role: 'participant',
              permissions: {
                ...p.permissions,
                canMuteOthers: false,
                canRemoveOthers: false,
                canPromoteToHost: false,
                canRecord: false,
              }
            }
          : p
      )
    );
  };

  const handleMuteAll = () => {
    setDemoParticipants(prev => 
      prev.map(p => 
        !p.isLocal ? { ...p, audio: 'muted' } : p
      )
    );
  };

  const handleMuteAllExceptHost = () => {
    setDemoParticipants(prev => 
      prev.map(p => 
        !p.isLocal && p.role !== 'host' ? { ...p, audio: 'muted' } : p
      )
    );
  };

  const addDemoParticipant = () => {
    const newId = `user-${Math.floor(Math.random() * 1000)}`;
    const newParticipant: Participant = {
      attendeeId: newId,
      externalUserId: newId,
      name: `Demo User ${Math.floor(Math.random() * 100)}`,
      role: 'participant',
      status: 'connected',
      audio: 'unmuted',
      video: 'on',
      isLocal: false,
      joinTime: new Date(),
      connectionQuality: 'excellent',
      permissions: {
        canMuteOthers: false,
        canRemoveOthers: false,
        canPromoteToHost: false,
        canRecord: false,
        canShareScreen: true,
      },
    };
    setDemoParticipants(prev => [...prev, newParticipant]);
  };

  const toggleSpeaking = () => {
    setDemoParticipants(prev => 
      prev.map(p => 
        p.attendeeId === 'user-456' 
          ? { ...p, audio: p.audio === 'speaking' ? 'unmuted' : 'speaking' }
          : p
      )
    );
  };

  const toggleConnectionQuality = () => {
    setDemoParticipants(prev => 
      prev.map(p => 
        p.attendeeId === 'user-789' 
          ? { 
              ...p, 
              connectionQuality: p.connectionQuality === 'poor' ? 'excellent' : 'poor' 
            }
          : p
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Enhanced Participant Management Demo
            <Badge variant="secondary">Interactive</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={addDemoParticipant} variant="outline">
              Add Demo Participant
            </Button>
            <Button onClick={toggleSpeaking} variant="outline">
              Toggle Speaking Demo
            </Button>
            <Button onClick={toggleConnectionQuality} variant="outline">
              Toggle Connection Quality
            </Button>
            <Button onClick={handleMuteAll} variant="outline">
              Mute All
            </Button>
            <Button onClick={handleMuteAllExceptHost} variant="outline">
              Mute All Except Host
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>• Click the three dots (⋯) next to participants to see management options</p>
            <p>• Host and co-hosts can manage other participants</p>
            <p>• Try the demo buttons above to see different states</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        <ParticipantProvider 
          meetingSession={null} 
          currentUserId={currentUserId}
        >
          <ParticipantList
            participants={demoParticipants}
            currentUserId={currentUserId}
            onMuteParticipant={handleMuteParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            onPromoteToCoHost={handlePromoteToCoHost}
            onDemoteFromCoHost={handleDemoteFromCoHost}
            onMuteAll={handleMuteAll}
            onMuteAllExceptHost={handleMuteAllExceptHost}
          />
        </ParticipantProvider>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Features Showcased</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium">Role Management</h4>
              <p className="text-sm text-gray-600">
                Host (👑), Co-Host (🛡️), and Participant (👤) roles with different permissions
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Status Indicators</h4>
              <p className="text-sm text-gray-600">
                Connection status, audio/video state, speaking detection, and connection quality
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Management Controls</h4>
              <p className="text-sm text-gray-600">
                Mute/unmute, promote/demote, remove participants, and bulk actions
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Real-time Updates</h4>
              <p className="text-sm text-gray-600">
                Join time tracking, duration display, and live status changes
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Accessibility</h4>
              <p className="text-sm text-gray-600">
                Keyboard navigation, screen reader support, and high contrast indicators
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParticipantListDemo;
