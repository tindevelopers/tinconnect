import { RequestHandler } from "express";
import { ChimeService } from "../lib/chime-service.js";
import { ApiResponse } from "@shared/api";

const chimeService = new ChimeService();

export const testChimeConnection: RequestHandler = async (req, res) => {
  try {
    console.log('Testing Chime SDK connection...');
    
    const isConnected = await chimeService.testConnection();
    
    const response: ApiResponse<{ connected: boolean; message: string }> = {
      success: true,
      data: {
        connected: isConnected,
        message: isConnected 
          ? 'Chime SDK connection successful' 
          : 'Chime SDK connection failed'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error testing Chime connection:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test Chime connection'
    };
    
    res.status(500).json(response);
  }
};

export const createTestMeeting: RequestHandler = async (req, res) => {
  try {
    console.log('Creating test Chime meeting...');
    
    const testMeeting = await chimeService.createMeeting({
      ClientRequestToken: `test-${Date.now()}`,
      ExternalMeetingId: `test-external-${Date.now()}`,
      MediaRegion: process.env.AWS_REGION || 'us-east-1',
    });
    
    const response: ApiResponse<typeof testMeeting> = {
      success: true,
      data: testMeeting
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error creating test meeting:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create test meeting'
    };
    
    res.status(500).json(response);
  }
};
