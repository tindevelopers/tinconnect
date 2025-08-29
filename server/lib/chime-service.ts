import { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand, DeleteMeetingCommand, DeleteAttendeeCommand } from '@aws-sdk/client-chime-sdk-meetings';
import { ChimeMeetingResponse, ChimeAttendeeResponse } from '@shared/api';

export class ChimeService {
  private client: ChimeSDKMeetingsClient;

  constructor() {
    this.client = new ChimeSDKMeetingsClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Create a new Chime meeting
   */
  async createMeeting(params: {
    ClientRequestToken: string;
    ExternalMeetingId: string;
    MediaRegion: string;
  }): Promise<ChimeMeetingResponse> {
    try {
      const command = new CreateMeetingCommand({
        ClientRequestToken: params.ClientRequestToken,
        ExternalMeetingId: params.ExternalMeetingId,
        MediaRegion: params.MediaRegion,
      });

      const response = await this.client.send(command);
      return response as ChimeMeetingResponse;
    } catch (error) {
      console.error('Error creating Chime meeting:', error);
      throw new Error('Failed to create Chime meeting');
    }
  }

  /**
   * Create a Chime attendee
   */
  async createAttendee(params: {
    MeetingId: string;
    ExternalUserId: string;
  }): Promise<ChimeAttendeeResponse> {
    try {
      const command = new CreateAttendeeCommand({
        MeetingId: params.MeetingId,
        ExternalUserId: params.ExternalUserId,
      });

      const response = await this.client.send(command);
      return response as ChimeAttendeeResponse;
    } catch (error) {
      console.error('Error creating Chime attendee:', error);
      throw new Error('Failed to create Chime attendee');
    }
  }

  /**
   * Delete a Chime meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const command = new DeleteMeetingCommand({
        MeetingId: meetingId,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting Chime meeting:', error);
      // Don't throw error for cleanup operations
    }
  }

  /**
   * Delete a Chime attendee
   */
  async deleteAttendee(meetingId: string, attendeeId: string): Promise<void> {
    try {
      const command = new DeleteAttendeeCommand({
        MeetingId: meetingId,
        AttendeeId: attendeeId,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting Chime attendee:', error);
      // Don't throw error for cleanup operations
    }
  }

  /**
   * Generate a join token for an attendee
   */
  async generateJoinToken(meetingId: string, attendeeId: string): Promise<string> {
    try {
      // This would typically involve creating a JWT token
      // For now, we'll return a simple token
      const token = Buffer.from(`${meetingId}:${attendeeId}:${Date.now()}`).toString('base64');
      return token;
    } catch (error) {
      console.error('Error generating join token:', error);
      throw new Error('Failed to generate join token');
    }
  }
}
