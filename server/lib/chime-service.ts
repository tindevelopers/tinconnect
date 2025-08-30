import {
  ChimeSDKMeetingsClient,
  CreateMeetingCommand,
  CreateAttendeeCommand,
  DeleteMeetingCommand,
  DeleteAttendeeCommand,
  GetMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings";
import { ChimeMeetingResponse, ChimeAttendeeResponse } from "@shared/api";

export class ChimeService {
  private client: ChimeSDKMeetingsClient | null = null;

  constructor() {
    // Environment-aware configuration
    const isProduction = process.env.NODE_ENV === "production";
    const isPreview = process.env.VERCEL_ENV === "preview";
    const isDevelopment = !isProduction && !isPreview;

    // Debug logging
    console.log(
      "ChimeService Environment:",
      isProduction ? "Production" : isPreview ? "Preview" : "Development",
    );
    console.log("AWS Region:", process.env.AWS_REGION);
    console.log("AWS Access Key ID:", process.env.AWS_ACCESS_KEY_ID ? "Set" : "Not set");
    console.log(
      "AWS Secret Access Key:",
      process.env.AWS_SECRET_ACCESS_KEY ? "Set" : "Not set",
    );
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("VERCEL_ENV:", process.env.VERCEL_ENV);
    console.log("Raw AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "Present" : "Missing");
    console.log("Raw AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "Present" : "Missing");
    console.log("awsAccessKeyId value:", process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...` : "undefined");
    console.log("awsSecretAccessKey value:", process.env.AWS_SECRET_ACCESS_KEY ? `${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 8)}...` : "undefined");
    console.log("awsAccessKeyId length:", process.env.AWS_ACCESS_KEY_ID?.length || 0);
    console.log("awsSecretAccessKey length:", process.env.AWS_SECRET_ACCESS_KEY?.length || 0);

    // Check if credentials are available
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      console.log("ChimeService: AWS credentials configured successfully");
    } else {
      console.warn(
        "ChimeService: AWS credentials not configured. Chime SDK features will not be available.",
      );
    }
  }

  private getCredentials() {
    // Environment-aware configuration
    const isProduction = process.env.NODE_ENV === "production";
    const isPreview = process.env.VERCEL_ENV === "preview";

    // Select environment variables based on deployment environment
    const awsRegion = isProduction
      ? process.env.AWS_REGION
      : process.env.AWS_REGION_PREVIEW || process.env.AWS_REGION;

    const awsAccessKeyId = isProduction
      ? process.env.AWS_ACCESS_KEY_ID
      : process.env.AWS_ACCESS_KEY_ID_PREVIEW || process.env.AWS_ACCESS_KEY_ID;

    const awsSecretAccessKey = isProduction
      ? process.env.AWS_SECRET_ACCESS_KEY
      : process.env.AWS_SECRET_ACCESS_KEY_PREVIEW ||
        process.env.AWS_SECRET_ACCESS_KEY;

    if (!awsAccessKeyId || !awsSecretAccessKey) {
      console.error("ChimeService: No AWS credentials available");
      console.error("Available environment variables:");
      console.error("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "Present" : "Missing");
      console.error("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "Present" : "Missing");
      console.error("AWS_REGION:", process.env.AWS_REGION || "Not set");
      throw new Error(
        "AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.",
      );
    }

    return {
      region: awsRegion || "us-east-1",
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    };
  }

  private ensureClient(): ChimeSDKMeetingsClient {
    if (!this.client) {
      const credentials = this.getCredentials();
      this.client = new ChimeSDKMeetingsClient({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
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
      console.log("Creating Chime meeting with params:", {
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
      console.log(
        "Chime meeting created successfully:",
        response.Meeting?.MeetingId,
      );

      return response as ChimeMeetingResponse;
    } catch (error) {
      console.error("Error creating Chime meeting:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("AccessDenied")) {
          throw new Error(
            "AWS credentials are invalid or insufficient permissions",
          );
        }
        if (error.message.includes("InvalidParameter")) {
          throw new Error("Invalid parameters provided for meeting creation");
        }
      }

      throw new Error("Failed to create Chime meeting");
    }
  }

  /**
   * Get meeting details from Chime
   */
  async getMeeting(meetingId: string): Promise<ChimeMeetingResponse> {
    try {
      console.log("Getting Chime meeting:", meetingId);

      const client = this.ensureClient();
      
      const command = new GetMeetingCommand({
        MeetingId: meetingId,
      });

      const response = await client.send(command);
      console.log("Chime meeting retrieved successfully:", response.Meeting?.MeetingId);
      
      return response as ChimeMeetingResponse;
    } catch (error) {
      console.error("Error getting Chime meeting:", error);
      throw new Error("Failed to get Chime meeting");
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
      console.log("Creating Chime attendee with params:", {
        MeetingId: params.MeetingId,
        ExternalUserId: params.ExternalUserId,
      });

      const command = new CreateAttendeeCommand({
        MeetingId: params.MeetingId,
        ExternalUserId: params.ExternalUserId,
      });

      const client = this.ensureClient();
      const response = await client.send(command);
      console.log(
        "Chime attendee created successfully:",
        response.Attendee?.AttendeeId,
      );

      return response as ChimeAttendeeResponse;
    } catch (error) {
      console.error("Error creating Chime attendee:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("NotFound")) {
          throw new Error("Meeting not found");
        }
        if (error.message.includes("Conflict")) {
          throw new Error("Attendee already exists for this meeting");
        }
      }

      throw new Error("Failed to create Chime attendee");
    }
  }

  /**
   * Delete a Chime meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      console.log("Deleting Chime meeting:", meetingId);

      const command = new DeleteMeetingCommand({
        MeetingId: meetingId,
      });

      const client = this.ensureClient();
      await client.send(command);
      console.log("Chime meeting deleted successfully:", meetingId);
    } catch (error) {
      console.error("Error deleting Chime meeting:", error);
      // Don't throw error for cleanup operations, but log it
    }
  }

  /**
   * Delete a Chime attendee
   */
  async deleteAttendee(meetingId: string, attendeeId: string): Promise<void> {
    try {
      console.log("Deleting Chime attendee:", { meetingId, attendeeId });

      const command = new DeleteAttendeeCommand({
        MeetingId: meetingId,
        AttendeeId: attendeeId,
      });

      const client = this.ensureClient();
      await client.send(command);
      console.log("Chime attendee deleted successfully:", attendeeId);
    } catch (error) {
      console.error("Error deleting Chime attendee:", error);
      // Don't throw error for cleanup operations, but log it
    }
  }

  /**
   * Generate a join token for an attendee
   */
  async generateJoinToken(
    meetingId: string,
    attendeeId: string,
  ): Promise<string> {
    try {
      // This would typically involve creating a JWT token
      // For now, we'll return a simple token
      const token = Buffer.from(
        `${meetingId}:${attendeeId}:${Date.now()}`,
      ).toString("base64");
      return token;
    } catch (error) {
      console.error("Error generating join token:", error);
      throw new Error("Failed to generate join token");
    }
  }

  /**
   * Test AWS credentials and permissions
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("Testing Chime SDK connection...");

      // Try to create a test meeting
      const testMeeting = await this.createMeeting({
        ClientRequestToken: `test-${Date.now()}`,
        ExternalMeetingId: `test-external-${Date.now()}`,
        MediaRegion: process.env.AWS_REGION || "us-east-1",
      });

      // Clean up the test meeting
      if (testMeeting.Meeting?.MeetingId) {
        await this.deleteMeeting(testMeeting.Meeting.MeetingId);
      }

      console.log("Chime SDK connection test successful");
      return true;
    } catch (error) {
      console.error("Chime SDK connection test failed:", error);
      return false;
    }
  }
}
