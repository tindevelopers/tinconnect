import { RequestHandler } from "express";
import { z } from "zod";
import { MeetingService } from "../services/meeting-service.js";
import { ApiResponse, CreateMeetingRequest, JoinMeetingRequest, Meeting } from "@shared/api";

const meetingService = new MeetingService();

// Validation schemas
const createMeetingSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  description: z.string().optional(),
  host_id: z.string().min(1, "Host ID is required"),
  scheduled_at: z.string().datetime().optional(),
  settings: z.object({
    recordingEnabled: z.boolean().optional(),
    chatEnabled: z.boolean().optional(),
    screenShareEnabled: z.boolean().optional(),
    waitingRoomEnabled: z.boolean().optional(),
  }).optional(),
});

const joinMeetingSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
});

export const createMeeting: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req.params;
    console.log('Create meeting request:', { tenantId, body: req.body });
    
    const validatedData = createMeetingSchema.parse(req.body);
    console.log('Validated data:', validatedData);
    
    const meeting = await meetingService.createMeeting({
      ...validatedData,
      tenantId,
    });
    
    const response: ApiResponse<Meeting> = {
      success: true,
      data: meeting,
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating meeting:", error);
    
    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.errors[0].message,
      };
      return res.status(400).json(response);
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create meeting",
    };
    res.status(500).json(response);
  }
};

export const getMeeting: RequestHandler = async (req, res) => {
  try {
    const { tenantId, meetingId } = req.params;
    const meeting = await meetingService.getMeeting(tenantId, meetingId);
    
    if (!meeting) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Meeting not found",
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<Meeting> = {
      success: true,
      data: meeting,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error getting meeting:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get meeting",
    };
    res.status(500).json(response);
  }
};

export const getMeetings: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { status } = req.query;
    
    const meetings = await meetingService.getTenantMeetings(
      tenantId, 
      status as Meeting['status']
    );
    
    const response: ApiResponse<Meeting[]> = {
      success: true,
      data: meetings,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error getting meetings:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get meetings",
    };
    res.status(500).json(response);
  }
};

export const joinMeeting: RequestHandler = async (req, res) => {
  try {
    const { tenantId, meetingId } = req.params;
    const validatedData = joinMeetingSchema.parse(req.body);
    
    const joinResponse = await meetingService.joinMeeting({
      ...validatedData,
      meetingId,
      tenantId,
    });
    
    const response: ApiResponse<typeof joinResponse> = {
      success: true,
      data: joinResponse,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error joining meeting:", error);
    
    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.errors[0].message,
      };
      return res.status(400).json(response);
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to join meeting",
    };
    res.status(500).json(response);
  }
};

export const leaveMeeting: RequestHandler = async (req, res) => {
  try {
    const { tenantId, meetingId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User ID is required",
      };
      return res.status(400).json(response);
    }
    
    await meetingService.leaveMeeting(tenantId, meetingId, userId);
    
    const response: ApiResponse<null> = {
      success: true,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error leaving meeting:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to leave meeting",
    };
    res.status(500).json(response);
  }
};

export const endMeeting: RequestHandler = async (req, res) => {
  try {
    const { tenantId, meetingId } = req.params;
    await meetingService.endMeeting(tenantId, meetingId);
    
    const response: ApiResponse<null> = {
      success: true,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error ending meeting:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to end meeting",
    };
    res.status(500).json(response);
  }
};
