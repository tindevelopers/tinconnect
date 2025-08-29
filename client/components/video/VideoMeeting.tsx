import React, { useEffect, useState, useRef } from 'react';
import {
  MeetingProvider,
  useMeetingManager,
  useLocalVideo,
  useLocalAudio,
  useToggleLocalMute,
  useToggleLocalVideo,
  useMeetingManagerState,
  useRoster,
  useActiveSpeaker,
  useLocalParticipant,
  useRemoteParticipants,
  useVideoTileState,
  useAudioVideo,
  useMeetingStatus,
  MeetingStatus,
} from 'amazon-chime-sdk-component-library-react';
import {
  MeetingSessionConfiguration,
  ConsoleLogger,
  DefaultDeviceController,
  LogLevel,
} from 'amazon-chime-sdk-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Settings,
  Users,
  MessageSquare,
  Share,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JoinMeetingResponse } from '@shared/api';

interface VideoMeetingProps {
  joinData: JoinMeetingResponse;
  onLeave: () => void;
}

const VideoMeetingContent: React.FC<VideoMeetingProps> = ({ joinData, onLeave }) => {
  const meetingManager = useMeetingManager();
  const { meetingStatus } = useMeetingManagerState();
  const { isVideoEnabled } = useLocalVideo();
  const { isAudioMuted } = useLocalAudio();
  const { toggleMute } = useToggleLocalMute();
  const { toggleVideo } = useToggleLocalVideo();
  const { roster } = useRoster();
  const { activeSpeakers } = useActiveSpeaker();
  const { localParticipant } = useLocalParticipant();
  const { remoteParticipants } = useRemoteParticipants();
  const { videoTileStates } = useVideoTileState();
  const audioVideo = useAudioVideo();
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Configure the meeting session
        const configuration = new MeetingSessionConfiguration(
          joinData.chimeMeeting.Meeting,
          joinData.chimeAttendee.Attendee
        );

        // Set up logging
        const logger = new ConsoleLogger('VideoMeeting', LogLevel.INFO);
        const deviceController = new DefaultDeviceController(logger);

        // Initialize the meeting manager
        await meetingManager.join({
          deviceLabels: ['audioinput', 'audiooutput', 'videoinput'],
          meetingSessionConfiguration: configuration,
          deviceController,
        });

        // Start the meeting
        await meetingManager.start();
        setIsConnecting(false);
      } catch (err) {
        console.error('Failed to join meeting:', err);
        setError(err instanceof Error ? err.message : 'Failed to join meeting');
        setIsConnecting(false);
      }
    };

    initializeMeeting();

    return () => {
      meetingManager.leave();
    };
  }, [meetingManager, joinData]);

  const handleLeave = async () => {
    try {
      await meetingManager.leave();
      onLeave();
    } catch (err) {
      console.error('Error leaving meeting:', err);
    }
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  const handleToggleVideo = () => {
    toggleVideo();
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={onLeave} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (meetingStatus === MeetingStatus.Left) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Meeting Ended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You have left the meeting.</p>
            <Button onClick={onLeave} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-lg font-semibold">
            {joinData.meeting.title}
          </h1>
          <Badge variant={meetingStatus === MeetingStatus.Succeeded ? "default" : "secondary"}>
            {meetingStatus === MeetingStatus.Succeeded ? "Connected" : "Connecting..."}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm">
            {Object.keys(roster).length} participants
          </span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
          {/* Local Video */}
          {isVideoEnabled && (
            <div className="relative bg-gray-700 rounded-lg overflow-hidden">
              <video
                ref={(ref) => {
                  if (ref && localParticipant?.videoTileId) {
                    audioVideo?.bindVideoElement(localParticipant.videoTileId, ref);
                  }
                }}
                className="w-full h-full object-cover"
                autoPlay
                muted
              />
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary">
                  {localParticipant?.name || 'You'}
                  {isAudioMuted && <MicOff className="ml-1 h-3 w-3" />}
                </Badge>
              </div>
            </div>
          )}

          {/* Remote Videos */}
          {Object.values(remoteParticipants).map((participant) => {
            const videoTile = videoTileStates[participant.videoTileId || 0];
            if (!videoTile || !videoTile.active) return null;

            return (
              <div key={participant.attendeeId} className="relative bg-gray-700 rounded-lg overflow-hidden">
                <video
                  ref={(ref) => {
                    if (ref && participant.videoTileId) {
                      audioVideo?.bindVideoElement(participant.videoTileId, ref);
                    }
                  }}
                  className="w-full h-full object-cover"
                  autoPlay
                />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary">
                    {participant.name}
                    {activeSpeakers.includes(participant.attendeeId) && (
                      <div className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isAudioMuted ? "destructive" : "default"}
            size="lg"
            onClick={handleToggleMute}
            className="rounded-full w-12 h-12 p-0"
          >
            {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant={!isVideoEnabled ? "destructive" : "default"}
            size="lg"
            onClick={handleToggleVideo}
            className="rounded-full w-12 h-12 p-0"
          >
            {!isVideoEnabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <Share className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <Users className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleLeave}
            className="rounded-full w-12 h-12 p-0"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const VideoMeeting: React.FC<VideoMeetingProps> = (props) => {
  return (
    <MeetingProvider>
      <VideoMeetingContent {...props} />
    </MeetingProvider>
  );
};

export default VideoMeeting;
