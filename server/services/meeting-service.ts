import { supabase } from '../lib/supabase.js';
import { 
  Meeting, 
  MeetingInsert, 
  MeetingUpdate,
  MeetingParticipant, 
  MeetingParticipantInsert, 
  MeetingParticipantUpdate,
  MeetingStatus,
  ParticipantRole
} from '../lib/database.types.js';
import { ChimeService } from '../lib/chime-service.js';
import { 
  CreateMeetingRequest, 
  JoinMeetingRequest, 
  JoinMeetingResponse,
  ChimeMeetingResponse,
  ChimeAttendeeResponse 
} from '@shared/api';

export class MeetingService {
  private chimeService: ChimeService;

  constructor() {
    this.chimeService = new ChimeService();
  }

  /**
   * Create a new meeting
   */
  async createMeeting(request: CreateMeetingRequest): Promise<Meeting> {
    try {
      // Create Chime meeting first
      const chimeMeeting = await this.chimeService.createMeeting({
        ClientRequestToken: `meeting-${Date.now()}`,
        ExternalMeetingId: `external-${Date.now()}`,
        MediaRegion: process.env.AWS_REGION || 'us-east-1',
      });

      // Create meeting in database
      const meetingData: MeetingInsert = {
        tenant_id: request.tenant_id,
        title: request.title,
        description: request.description,
        host_id: request.host_id,
        scheduled_at: request.scheduled_at,
        chime_meeting_id: chimeMeeting.Meeting.MeetingId,
        settings: {
          recordingEnabled: request.settings?.recordingEnabled ?? true,
          chatEnabled: request.settings?.chatEnabled ?? true,
          screenShareEnabled: request.settings?.screenShareEnabled ?? true,
          waitingRoomEnabled: request.settings?.waitingRoomEnabled ?? false,
        },
        status: 'scheduled',
      };

      const { data: meeting, error } = await supabase
        .from('meetings')
        .insert(meetingData)
        .select()
        .single();

      if (error) {
        // Clean up Chime meeting if database insert fails
        await this.chimeService.deleteMeeting(chimeMeeting.Meeting.MeetingId);
        console.error('Error creating meeting:', error);
        throw new Error('Failed to create meeting');
      }

      return meeting as Meeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw new Error('Failed to create meeting');
    }
  }

  /**
   * Get a meeting by ID within a tenant
   */
  async getMeeting(tenantId: string, meetingId: string): Promise<Meeting | null> {
    try {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting meeting:', error);
        throw new Error('Failed to get meeting');
      }

      return meeting as Meeting;
    } catch (error) {
      console.error('Error getting meeting:', error);
      throw new Error('Failed to get meeting');
    }
  }

  /**
   * Get all meetings for a tenant
   */
  async getTenantMeetings(tenantId: string): Promise<Meeting[]> {
    try {
      const { data: meetings, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting tenant meetings:', error);
        throw new Error('Failed to get tenant meetings');
      }

      return (meetings || []) as Meeting[];
    } catch (error) {
      console.error('Error getting tenant meetings:', error);
      throw new Error('Failed to get tenant meetings');
    }
  }

  /**
   * Get meetings with participant count
   */
  async getTenantMeetingsWithStats(tenantId: string): Promise<Array<Meeting & { participant_count: number }>> {
    try {
      const { data: meetings, error } = await supabase
        .from('tenant_meetings')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting tenant meetings with stats:', error);
        throw new Error('Failed to get tenant meetings with stats');
      }

      return (meetings || []) as Array<Meeting & { participant_count: number }>;
    } catch (error) {
      console.error('Error getting tenant meetings with stats:', error);
      throw new Error('Failed to get tenant meetings with stats');
    }
  }

  /**
   * Join a meeting
   */
  async joinMeeting(request: JoinMeetingRequest): Promise<JoinMeetingResponse> {
    try {
      // Get the meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', request.meeting_id)
        .single();

      if (meetingError || !meeting) {
        throw new Error('Meeting not found');
      }

      // Check if meeting is active or scheduled
      if (meeting.status === 'ended' || meeting.status === 'cancelled') {
        throw new Error('Meeting is not available for joining');
      }

      // Create Chime attendee
      const chimeAttendee = await this.chimeService.createAttendee({
        MeetingId: meeting.chime_meeting_id!,
        ExternalUserId: request.user_id,
      });

      // Add participant to meeting
      const participantData: MeetingParticipantInsert = {
        meeting_id: request.meeting_id,
        user_id: request.user_id,
        name: request.name,
        email: request.email,
        role: 'attendee', // Default role, can be updated later
        joined_at: new Date().toISOString(),
        is_present: true,
        chime_attendee_id: chimeAttendee.Attendee.AttendeeId,
      };

      const { data: participant, error: participantError } = await supabase
        .from('meeting_participants')
        .upsert(participantData, {
          onConflict: 'meeting_id,user_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (participantError) {
        // Clean up Chime attendee if database insert fails
        await this.chimeService.deleteAttendee(
          meeting.chime_meeting_id!,
          chimeAttendee.Attendee.AttendeeId
        );
        console.error('Error creating participant:', participantError);
        throw new Error('Failed to join meeting');
      }

      // Update meeting status to active if it was scheduled
      if (meeting.status === 'scheduled') {
        await this.updateMeetingStatus(meeting.tenant_id, meeting.id, 'active');
      }

      return {
        meeting: meeting as Meeting,
        chimeMeeting: {
          Meeting: {
            MeetingId: meeting.chime_meeting_id!,
            ExternalMeetingId: `external-${meeting.id}`,
            MediaPlacement: {
              AudioHostUrl: `https://${meeting.chime_meeting_id}.chime.aws`,
              AudioFallbackUrl: `https://${meeting.chime_meeting_id}.chime.aws`,
              ScreenDataUrl: `https://${meeting.chime_meeting_id}.chime.aws`,
              ScreenSharingUrl: `https://${meeting.chime_meeting_id}.chime.aws`,
              ScreenViewingUrl: `https://${meeting.chime_meeting_id}.chime.aws`,
              SignalingUrl: `https://${meeting.chime_meeting_id}.chime.aws`,
              TurnControlUrl: `https://${meeting.chime_meeting_id}.chime.aws`,
            },
            MediaRegion: process.env.AWS_REGION || 'us-east-1',
          },
        },
        chimeAttendee,
      };
    } catch (error) {
      console.error('Error joining meeting:', error);
      throw new Error('Failed to join meeting');
    }
  }

  /**
   * Leave a meeting
   */
  async leaveMeeting(tenantId: string, meetingId: string, userId: string): Promise<void> {
    try {
      // Get the participant
      const { data: participant, error: participantError } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)
        .single();

      if (participantError || !participant) {
        throw new Error('Participant not found');
      }

      // Update participant to mark as left
      const { error: updateError } = await supabase
        .from('meeting_participants')
        .update({
          left_at: new Date().toISOString(),
          is_present: false,
        })
        .eq('id', participant.id);

      if (updateError) {
        console.error('Error updating participant:', updateError);
        throw new Error('Failed to leave meeting');
      }

      // Delete Chime attendee if exists
      if (participant.chime_attendee_id) {
        const meeting = await this.getMeeting(tenantId, meetingId);
        if (meeting?.chime_meeting_id) {
          await this.chimeService.deleteAttendee(
            meeting.chime_meeting_id,
            participant.chime_attendee_id
          );
        }
      }

      // Check if meeting should be ended (no more participants)
      await this.checkAndEndMeetingIfEmpty(tenantId, meetingId);
    } catch (error) {
      console.error('Error leaving meeting:', error);
      throw new Error('Failed to leave meeting');
    }
  }

  /**
   * End a meeting
   */
  async endMeeting(tenantId: string, meetingId: string): Promise<void> {
    try {
      // Get the meeting
      const meeting = await this.getMeeting(tenantId, meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // Update meeting status
      await this.updateMeetingStatus(tenantId, meetingId, 'ended');

      // Delete Chime meeting
      if (meeting.chime_meeting_id) {
        await this.chimeService.deleteMeeting(meeting.chime_meeting_id);
      }

      // Mark all participants as left
      const { error: updateError } = await supabase
        .from('meeting_participants')
        .update({
          left_at: new Date().toISOString(),
          is_present: false,
        })
        .eq('meeting_id', meetingId)
        .eq('is_present', true);

      if (updateError) {
        console.error('Error updating participants:', updateError);
      }
    } catch (error) {
      console.error('Error ending meeting:', error);
      throw new Error('Failed to end meeting');
    }
  }

  /**
   * Update meeting status
   */
  async updateMeetingStatus(tenantId: string, meetingId: string, status: MeetingStatus): Promise<Meeting> {
    try {
      const updateData: MeetingUpdate = {
        status,
        ...(status === 'active' && { started_at: new Date().toISOString() }),
        ...(status === 'ended' && { ended_at: new Date().toISOString() }),
      };

      const { data: meeting, error } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', meetingId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        console.error('Error updating meeting status:', error);
        throw new Error('Failed to update meeting status');
      }

      return meeting as Meeting;
    } catch (error) {
      console.error('Error updating meeting status:', error);
      throw new Error('Failed to update meeting status');
    }
  }

  /**
   * Get meeting participants
   */
  async getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]> {
    try {
      const { data: participants, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error getting meeting participants:', error);
        throw new Error('Failed to get meeting participants');
      }

      return (participants || []) as MeetingParticipant[];
    } catch (error) {
      console.error('Error getting meeting participants:', error);
      throw new Error('Failed to get meeting participants');
    }
  }

  /**
   * Update participant presence
   */
  async updateParticipantPresence(
    meetingId: string, 
    userId: string, 
    isPresent: boolean
  ): Promise<MeetingParticipant> {
    try {
      const updateData: MeetingParticipantUpdate = {
        is_present: isPresent,
        ...(isPresent && { joined_at: new Date().toISOString() }),
        ...(!isPresent && { left_at: new Date().toISOString() }),
      };

      const { data: participant, error } = await supabase
        .from('meeting_participants')
        .update(updateData)
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating participant presence:', error);
        throw new Error('Failed to update participant presence');
      }

      return participant as MeetingParticipant;
    } catch (error) {
      console.error('Error updating participant presence:', error);
      throw new Error('Failed to update participant presence');
    }
  }

  /**
   * Check if meeting should be ended (no more participants)
   */
  private async checkAndEndMeetingIfEmpty(tenantId: string, meetingId: string): Promise<void> {
    try {
      const { count } = await supabase
        .from('meeting_participants')
        .select('*', { count: 'exact', head: true })
        .eq('meeting_id', meetingId)
        .eq('is_present', true);

      if (count === 0) {
        // No more participants, end the meeting
        await this.endMeeting(tenantId, meetingId);
      }
    } catch (error) {
      console.error('Error checking meeting participants:', error);
    }
  }

  /**
   * Get meeting statistics
   */
  async getMeetingStats(tenantId: string): Promise<{
    totalMeetings: number;
    activeMeetings: number;
    scheduledMeetings: number;
    endedMeetings: number;
  }> {
    try {
      // Get total meetings
      const { count: totalMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Get active meetings
      const { count: activeMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      // Get scheduled meetings
      const { count: scheduledMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'scheduled');

      // Get ended meetings
      const { count: endedMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'ended');

      return {
        totalMeetings: totalMeetings || 0,
        activeMeetings: activeMeetings || 0,
        scheduledMeetings: scheduledMeetings || 0,
        endedMeetings: endedMeetings || 0,
      };
    } catch (error) {
      console.error('Error getting meeting stats:', error);
      throw new Error('Failed to get meeting statistics');
    }
  }

  /**
   * Get user's meetings
   */
  async getUserMeetings(userId: string): Promise<Array<Meeting & { is_host: boolean; participant_count: number }>> {
    try {
      // Use the database function for optimized queries
      const { data: meetings, error } = await supabase
        .rpc('get_user_meetings', { user_uuid: userId });

      if (error) {
        console.error('Error getting user meetings:', error);
        throw new Error('Failed to get user meetings');
      }

      return (meetings || []) as Array<Meeting & { is_host: boolean; participant_count: number }>;
    } catch (error) {
      console.error('Error getting user meetings:', error);
      throw new Error('Failed to get user meetings');
    }
  }

  /**
   * Cancel a meeting
   */
  async cancelMeeting(tenantId: string, meetingId: string): Promise<Meeting> {
    try {
      const meeting = await this.getMeeting(tenantId, meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      if (meeting.status === 'ended' || meeting.status === 'cancelled') {
        throw new Error('Meeting is already ended or cancelled');
      }

      // Update meeting status to cancelled
      const { data: updatedMeeting, error } = await supabase
        .from('meetings')
        .update({ 
          status: 'cancelled',
          ended_at: new Date().toISOString(),
        })
        .eq('id', meetingId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling meeting:', error);
        throw new Error('Failed to cancel meeting');
      }

      return updatedMeeting as Meeting;
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      throw new Error('Failed to cancel meeting');
    }
  }
}
