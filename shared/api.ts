/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
  timestamp: string;
}

// Multi-tenant video platform shared types

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: {
    maxParticipants: number;
    recordingEnabled: boolean;
    chatEnabled: boolean;
    screenShareEnabled: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  host_id: string;
  settings: {
    recordingEnabled: boolean;
    chatEnabled: boolean;
    screenShareEnabled: boolean;
    waitingRoomEnabled: boolean;
  };
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  chime_meeting_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'host' | 'attendee';
  joined_at?: string;
  left_at?: string;
  is_present: boolean;
  chime_attendee_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  meeting_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export interface ChimeMeetingResponse {
  Meeting: {
    MeetingId: string;
    ExternalMeetingId: string;
    MediaPlacement: {
      AudioHostUrl: string;
      AudioFallbackUrl: string;
      ScreenDataUrl: string;
      ScreenSharingUrl: string;
      ScreenViewingUrl: string;
      SignalingUrl: string;
      TurnControlUrl: string;
    };
    MediaRegion: string;
  };
}

export interface ChimeAttendeeResponse {
  Attendee: {
    AttendeeId: string;
    ExternalUserId: string;
    JoinToken: string;
  };
}

export interface CreateMeetingRequest {
  tenant_id: string;
  title: string;
  description?: string;
  host_id: string;
  scheduled_at?: string;
  settings?: Partial<Meeting['settings']>;
}

export interface JoinMeetingRequest {
  meeting_id: string;
  user_id: string;
  name: string;
  email: string;
}

export interface JoinMeetingResponse {
  meeting: Meeting;
  chimeMeeting: ChimeMeetingResponse;
  chimeAttendee: ChimeAttendeeResponse;
}

export interface CreateTenantRequest {
  name: string;
  domain: string;
  settings?: Partial<Tenant['settings']>;
}

export interface CreateUserRequest {
  tenantId: string;
  email: string;
  name: string;
  role?: User['role'];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface ParticipantJoinedMessage {
  type: 'participant_joined';
  payload: {
    meeting_id: string;
    participant: MeetingParticipant;
  };
}

export interface ParticipantLeftMessage {
  type: 'participant_left';
  payload: {
    meeting_id: string;
    participant_id: string;
  };
}

export interface MeetingEndedMessage {
  type: 'meeting_ended';
  payload: {
    meeting_id: string;
  };
}
