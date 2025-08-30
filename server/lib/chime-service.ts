import { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand, DeleteMeetingCommand, DeleteAttendeeCommand } from '@aws-sdk/client-chime-sdk-meetings';
import { ChimeMeetingResponse, ChimeAttendeeResponse } from '@shared/api';

export class ChimeService {
  private client: ChimeSDKMeetingsClient | null = null;
  private credentials: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  } | null = null;

  constructor() {
    // Environment-aware configuration
    const isProduction = process.env.NODE_ENV === 'production';
    const isPreview = process.env.VERCEL_ENV === 'preview';
    const isDevelopment = !isProduction && !isPreview;

    // Select environment variables based on deployment environment
    const awsRegion = isProduction
      ? process.env.AWS_REGION
      : process.env.AWS_REGION_PREVIEW || process.env.AWS_REGION;

    const awsAccessKeyId = isProduction
      ? process.env.AWS_ACCESS_KEY_ID
      : process.env.AWS_ACCESS_KEY_ID_PREVIEW || process.env.AWS_ACCESS_KEY_ID;

    const awsSecretAccessKey = isProduction
      ? process.env.AWS_SECRET_ACCESS_KEY
      : process.env.AWS_SECRET_ACCESS_KEY_PREVIEW || process.env.AWS_SECRET_ACCESS_KEY;

    // Debug logging
    console.log('ChimeService Environment:', isProduction ? 'Production' : isPreview ? 'Preview' : 'Development');
    console.log('AWS Region:', awsRegion);
    console.log('AWS Access Key ID:', awsAccessKeyId ? 'Set' : 'Not set');
    console.log('AWS Secret Access Key:', awsSecretAccessKey ? 'Set' : 'Not set');

    // In development, credentials are optional - we'll check them when actually needed
    if (isDevelopment && (!awsAccessKeyId || !awsSecretAccessKey)) {
      console.warn('AWS credentials not configured for development. Chime SDK features will not be available.');
      return;
    }

    // In production/preview, credentials are required
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
    }

    // Store credentials for lazy initialization
    this.credentials = {
      region: awsRegion || 'us-east-1',
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    };
  }

  private ensureClient(): ChimeSDKMeetingsClient {
    if (!this.credentials) {
      throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
    }

    if (!this.client) {
      this.client = new ChimeSDKMeetingsClient({
        region: this.credentials.region,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
        },
      });
    }

    return this.client;
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
      console.log('Creating Chime meeting with params:', {
        ClientRequestToken: params.ClientRequestToken,
        ExternalMeetingId: params.ExternalMeetingId,
        MediaRegion: params.MediaRegion,
      });

      const command = new CreateMeetingCommand({
        ClientRequestToken: params.ClientRequestToken,
        ExternalMeetingId: params.ExternalMeetingId,
        MediaRegion: params.MediaRegion,
      });

      const client = this.ensureClient();
      const response = await client.send(command);
      console.log('Chime meeting created successfully:', response.Meeting?.MeetingId);
      
      return response as ChimeMeetingResponse;
    } catch (error) {
      console.error('Error creating Chime meeting:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('AccessDenied')) {
          throw new Error('AWS credentials are invalid or insufficient permissions');
        }
        if (error.message.includes('InvalidParameter')) {
          throw new Error('Invalid parameters provided for meeting creation');
        }
      }
      
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
      console.log('Creating Chime attendee with params:', {
        MeetingId: params.MeetingId,
        ExternalUserId: params.ExternalUserId,
      });

      const command = new CreateAttendeeCommand({
        MeetingId: params.MeetingId,
        ExternalUserId: params.ExternalUserId,
      });

      const client = this.ensureClient();
      const response = await client.send(command);
      console.log('Chime attendee created successfully:', response.Attendee?.AttendeeId);
      
      return response as ChimeAttendeeResponse;
    } catch (error) {
      console.error('Error creating Chime attendee:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('NotFound')) {
          throw new Error('Meeting not found');
        }
        if (error.message.includes('Conflict')) {
          throw new Error('Attendee already exists for this meeting');
        }
      }
      
      throw new Error('Failed to create Chime attendee');
    }
  }

  /**
   * Delete a Chime meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      console.log('Deleting Chime meeting:', meetingId);

      const command = new DeleteMeetingCommand({
        MeetingId: meetingId,
      });

      await this.client.send(command);
      console.log('Chime meeting deleted successfully:', meetingId);
    } catch (error) {
      console.error('Error deleting Chime meeting:', error);
      // Don't throw error for cleanup operations, but log it
    }
  }

  /**
   * Delete a Chime attendee
   */
  async deleteAttendee(meetingId: string, attendeeId: string): Promise<void> {
    try {
      console.log('Deleting Chime attendee:', { meetingId, attendeeId });

      const command = new DeleteAttendeeCommand({
        MeetingId: meetingId,
        AttendeeId: attendeeId,
      });

      await this.client.send(command);
      console.log('Chime attendee deleted successfully:', attendeeId);
    } catch (error) {
      console.error('Error deleting Chime attendee:', error);
      // Don't throw error for cleanup operations, but log it
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

  /**
   * Test AWS credentials and permissions
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Chime SDK connection...');
      
      // Try to create a test meeting
      const testMeeting = await this.createMeeting({
        ClientRequestToken: `test-${Date.now()}`,
        ExternalMeetingId: `test-external-${Date.now()}`,
        MediaRegion: process.env.AWS_REGION || 'us-east-1',
      });

      // Clean up the test meeting
      if (testMeeting.Meeting?.MeetingId) {
        await this.deleteMeeting(testMeeting.Meeting.MeetingId);
      }

      console.log('Chime SDK connection test successful');
      return true;
    } catch (error) {
      console.error('Chime SDK connection test failed:', error);
      return false;
    }
  }
}
