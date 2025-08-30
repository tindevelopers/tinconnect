import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Crown, 
  Shield, 
  User, 
  MoreVertical,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';

export interface Participant {
  attendeeId: string;
  externalUserId: string;
  name: string;
  role: 'host' | 'co-host' | 'participant';
  status: 'connected' | 'connecting' | 'disconnected';
  audio: 'muted' | 'unmuted' | 'speaking';
  video: 'on' | 'off' | 'paused';
  isLocal: boolean;
  joinTime: Date;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  permissions: ParticipantPermissions;
}

export interface ParticipantPermissions {
  canMuteOthers: boolean;
  canRemoveOthers: boolean;
  canPromoteToHost: boolean;
  canRecord: boolean;
  canShareScreen: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
  currentUserId: string;
  onMuteParticipant: (attendeeId: string) => void;
  onRemoveParticipant: (attendeeId: string) => void;
  onPromoteToCoHost: (attendeeId: string) => void;
  onDemoteFromCoHost: (attendeeId: string) => void;
  onMuteAll: () => void;
  onMuteAllExceptHost: () => void;
  className?: string;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  currentUserId,
  onMuteParticipant,
  onRemoveParticipant,
  onPromoteToCoHost,
  onDemoteFromCoHost,
  onMuteAll,
  onMuteAllExceptHost,
  className
}) => {
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);

  const currentUser = participants.find(p => p.attendeeId === currentUserId);
  const isHost = currentUser?.role === 'host';
  const isCoHost = currentUser?.role === 'co-host';

  const getRoleIcon = (role: Participant['role']) => {
    switch (role) {
      case 'host':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'co-host':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: Participant['status']) => {
    switch (status) {
      case 'connected':
        return <SignalHigh className="w-3 h-3 text-green-500" />;
      case 'connecting':
        return <SignalMedium className="w-3 h-3 text-yellow-500" />;
      case 'disconnected':
        return <SignalLow className="w-3 h-3 text-red-500" />;
      default:
        return <Signal className="w-3 h-3 text-gray-500" />;
    }
  };

  const getAudioIcon = (audio: Participant['audio']) => {
    switch (audio) {
      case 'speaking':
        return <Volume2 className="w-4 h-4 text-green-500 animate-pulse" />;
      case 'unmuted':
        return <Mic className="w-4 h-4 text-green-500" />;
      case 'muted':
        return <MicOff className="w-4 h-4 text-red-500" />;
      default:
        return <MicOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVideoIcon = (video: Participant['video']) => {
    switch (video) {
      case 'on':
        return <Video className="w-4 h-4 text-green-500" />;
      case 'off':
        return <VideoOff className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <VideoOff className="w-4 h-4 text-yellow-500" />;
      default:
        return <VideoOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConnectionQualityColor = (quality: Participant['connectionQuality']) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'fair':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDuration = (joinTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - joinTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const canManageParticipant = (participant: Participant) => {
    if (participant.isLocal) return false;
    if (isHost) return true;
    if (isCoHost && participant.role === 'participant') return true;
    return false;
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    // Host first, then co-hosts, then participants
    const roleOrder = { host: 0, 'co-host': 1, participant: 2 };
    const roleDiff = roleOrder[a.role] - roleOrder[b.role];
    if (roleDiff !== 0) return roleDiff;
    
    // Then by name
    return a.name.localeCompare(b.name);
  });

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Participants ({participants.length})
        </CardTitle>
        {(isHost || isCoHost) && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onMuteAll}
              className="flex-1"
            >
              <MicOff className="w-4 h-4 mr-1" />
              Mute All
            </Button>
            {isHost && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMuteAllExceptHost}
                className="flex-1"
              >
                <MicOff className="w-4 h-4 mr-1" />
                Except Host
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {sortedParticipants.map((participant) => (
            <div
              key={participant.attendeeId}
              className={cn(
                "flex items-center justify-between p-3 hover:bg-gray-50 transition-colors",
                participant.isLocal && "bg-blue-50 border-l-4 border-blue-500",
                expandedParticipant === participant.attendeeId && "bg-gray-100"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" alt={participant.name} />
                  <AvatarFallback className="text-xs">
                    {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {participant.name}
                    </span>
                    {participant.isLocal && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                    {getRoleIcon(participant.role)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {getStatusIcon(participant.status)}
                    <span className="capitalize">{participant.status}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(participant.joinTime)}</span>
                    <span>•</span>
                    <span className={getConnectionQualityColor(participant.connectionQuality)}>
                      {participant.connectionQuality}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {getAudioIcon(participant.audio)}
                  {getVideoIcon(participant.video)}
                </div>

                {canManageParticipant(participant) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onMuteParticipant(participant.attendeeId)}
                      >
                        {participant.audio === 'muted' ? (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Unmute
                          </>
                        ) : (
                          <>
                            <MicOff className="w-4 h-4 mr-2" />
                            Mute
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      {participant.role === 'participant' && isHost && (
                        <DropdownMenuItem
                          onClick={() => onPromoteToCoHost(participant.attendeeId)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Make Co-Host
                        </DropdownMenuItem>
                      )}
                      
                      {participant.role === 'co-host' && isHost && (
                        <DropdownMenuItem
                          onClick={() => onDemoteFromCoHost(participant.attendeeId)}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Remove Co-Host
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        onClick={() => onRemoveParticipant(participant.attendeeId)}
                        className="text-red-600"
                      >
                        Remove from Meeting
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantList;
