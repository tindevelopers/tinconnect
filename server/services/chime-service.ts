import { 
  ChimeSDKMeetingsClient, 
  CreateMeetingCommand, 
  CreateAttendeeCommand,
  DeleteMeetingCommand,
  DeleteAttendeeCommand 
} from '@aws-sdk/client-chime-sdk-meetings';
import { v4 as uuidv4 } from 'uuid';
import { 
  ChimeMeetingResponse, 
  ChimeAttendeeResponse,
  Meeting,
  MeetingParticipant 
} from '@shared/api';

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

  async createMeeting(externalMeetingId: string, meetingTitle: string): Promise<ChimeMeetingResponse> {
    const command = new CreateMeetingCommand({
      ClientRequestToken: uuidv4(),
      ExternalMeetingId: externalMeetingId,
      MediaRegion: process.env.AWS_REGION || 'us-east-1',
      MeetingHostId: externalMeetingId,
      NotificationsConfiguration: {
        SnsTopicArn: process.env.SNS_TOPIC_ARN,
        SqsQueueArn: process.env.SQS_QUEUE_ARN,
      },
    });

    try {
      const response = await this.client.send(command);
      return response as ChimeMeetingResponse;
    } catch (error) {
      console.error('Error creating Chime meeting:', error);
      throw new Error('Failed to create meeting');
    }
  }

  async createAttendee(meetingId: string, externalUserId: string): Promise<ChimeAttendeeResponse> {
    const command = new CreateAttendeeCommand({
      MeetingId: meetingId,
      ExternalUserId: externalUserId,
    });

    try {
      const response = await this.client.send(command);
      return response as ChimeAttendeeResponse;
    } catch (error) {
      console.error('Error creating Chime attendee:', error);
      throw new Error('Failed to create attendee');
    }
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    const command = new DeleteMeetingCommand({
      MeetingId: meetingId,
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting Chime meeting:', error);
      throw new Error('Failed to delete meeting');
    }
  }

  async deleteAttendee(meetingId: string, attendeeId: string): Promise<void> {
    const command = new DeleteAttendeeCommand({
      MeetingId: meetingId,
      AttendeeId: attendeeId,
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting Chime attendee:', error);
      throw new Error('Failed to delete attendee');
    }
  }

  generateJoinToken(meetingId: string, attendeeId: string): string {
    // In a production environment, you would use AWS STS to generate temporary credentials
    // For now, we'll return a simple token that can be validated on the client side
    return Buffer.from(`${meetingId}:${attendeeId}:${Date.now()}`).toString('base64');
  }
}
