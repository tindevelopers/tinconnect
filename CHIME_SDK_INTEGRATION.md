# Chime SDK Integration with Real-time Event Listeners

## Overview

This document describes the comprehensive integration of AWS Chime SDK with real-time event listeners for enhanced participant management in the TIN Connect video conferencing system.

## Architecture

### Components

1. **`ChimeSDKServerlessEnhanced.tsx`** - Enhanced Chime SDK component with real-time event listeners
2. **`ParticipantContext.tsx`** - State management for participant data
3. **`ParticipantList.tsx`** - UI component for displaying and managing participants
4. **`EnhancedMeetingInterface.tsx`** - Complete meeting interface with sidebar and controls

### Data Flow

```
Chime SDK Events → Event Listeners → Participant Context → UI Components
```

## Real-time Event Listeners

### 1. Attendee Presence Events

```typescript
// Subscribe to attendee join/leave events
audioVideo.realtimeSubscribeToAttendeeIdPresence((attendeeId: string, present: boolean) => {
  if (present) {
    // New attendee joined
    addParticipant({
      attendeeId,
      externalUserId: attendeeId,
      name: `Participant ${attendeeId.slice(-4)}`,
      role: 'participant',
      status: 'connected',
      audio: 'unmuted',
      video: 'on',
      isLocal: false,
      joinTime: new Date(),
      connectionQuality: 'excellent',
      permissions: defaultPermissions
    });
  } else {
    // Attendee left
    removeParticipant(attendeeId);
  }
});
```

### 2. Audio Level Monitoring

```typescript
// Subscribe to volume indicator changes for speaking detection
audioVideo.realtimeSubscribeToVolumeIndicator((attendeeId: string, level: number, muted: boolean, signalStrength: number) => {
  if (level > 0.1 && !muted) {
    // Participant is speaking
    updateParticipant(attendeeId, { audio: 'speaking' });
  } else {
    // Participant stopped speaking
    const participant = participants.find(p => p.attendeeId === attendeeId);
    if (participant && participant.audio === 'speaking') {
      updateParticipant(attendeeId, { audio: muted ? 'muted' : 'unmuted' });
    }
  }
});
```

### 3. Local Audio/Video State Changes

```typescript
// Subscribe to local audio mute changes
audioVideo.realtimeSubscribeToLocalAudioMuted((muted: boolean) => {
  setIsMuted(muted);
  updateParticipant(currentUserId, { audio: muted ? 'muted' : 'unmuted' });
});

// Subscribe to local video mute changes
audioVideo.realtimeSubscribeToLocalVideoMuted((muted: boolean) => {
  setIsVideoEnabled(!muted);
  updateParticipant(currentUserId, { video: muted ? 'off' : 'on' });
});
```

### 4. Remote Attendee State Changes

```typescript
// Subscribe to remote attendee audio/video state changes
audioVideo.realtimeSubscribeToAttendeeIdPresence((attendeeId: string, present: boolean) => {
  if (present && attendeeId !== currentUserId) {
    // Subscribe to remote attendee's audio/video state
    audioVideo.realtimeSubscribeToAttendeeIdPresence(attendeeId, (present: boolean) => {
      if (present) {
        audioVideo.realtimeSubscribeToVolumeIndicator(attendeeId, handleVolumeIndicator);
      }
    });
  }
});
```

### 5. Connection Health Monitoring

```typescript
// Monitor connection quality
const handleConnectionHealth = (attendeeId: string, health: number) => {
  let quality: Participant['connectionQuality'] = 'excellent';
  if (health < 0.5) quality = 'poor';
  else if (health < 0.7) quality = 'fair';
  else if (health < 0.9) quality = 'good';
  
  updateParticipant(attendeeId, { connectionQuality: quality });
};
```

## Participant Management Features

### Role-Based Permissions

| Role | Mute Others | Remove Others | Promote to Co-Host | Record | Share Screen |
|------|-------------|---------------|-------------------|---------|--------------|
| Host | ✅ | ✅ | ✅ | ✅ | ✅ |
| Co-Host | ✅ | ✅ | ❌ | ✅ | ✅ |
| Participant | ❌ | ❌ | ❌ | ❌ | ✅ |

### Management Actions

#### Individual Participant Actions
- **Mute/Unmute**: Toggle audio state for specific participants
- **Promote to Co-Host**: Grant co-host permissions
- **Demote from Co-Host**: Remove co-host permissions
- **Remove from Meeting**: Kick participant from meeting

#### Bulk Actions
- **Mute All**: Mute all participants except the current user
- **Mute All Except Host**: Mute all participants except the host

### Real-time Status Indicators

#### Audio Status
- **Muted**: Participant's microphone is off
- **Unmuted**: Participant's microphone is on
- **Speaking**: Participant is actively speaking (with animation)

#### Video Status
- **On**: Participant's camera is active
- **Off**: Participant's camera is disabled
- **Paused**: Participant's camera is temporarily paused

#### Connection Status
- **Connected**: Participant is fully connected
- **Connecting**: Participant is joining the meeting
- **Disconnected**: Participant has lost connection

#### Connection Quality
- **Excellent**: Optimal connection (green)
- **Good**: Good connection (blue)
- **Fair**: Moderate connection (yellow)
- **Poor**: Poor connection (red)

## UI Components

### Enhanced Meeting Interface

The complete meeting interface includes:

1. **Main Video Area**: Full-screen video display with overlay controls
2. **Sidebar**: Collapsible panel with tabs for:
   - Participants list
   - Chat interface
   - Meeting settings
3. **Control Bar**: Bottom controls for:
   - Mute/unmute
   - Video on/off
   - Screen sharing
   - Recording (host/co-host only)
   - Leave meeting

### Participant List Features

- **Avatar System**: User initials with fallback images
- **Role Badges**: Visual distinction between roles
- **Status Indicators**: Real-time audio/video/connection status
- **Management Controls**: Dropdown menus for participant actions
- **Bulk Actions**: Mute all buttons for hosts/co-hosts
- **Join Time Tracking**: Duration display for each participant

## Integration Points

### With Existing Components

1. **StartMeetingPage**: Uses enhanced meeting interface
2. **AuthContext**: Provides user authentication
3. **Supabase**: Stores meeting and participant data
4. **Serverless Backend**: Handles Chime SDK operations

### With Chime SDK

1. **Meeting Session**: Manages audio/video streams
2. **Device Controller**: Handles camera/microphone selection
3. **Real-time API**: Provides live participant updates
4. **Video Tile Observer**: Manages video element binding

## Demo Pages

### 1. Participant List Demo
**Route**: `/participant-demo`
- Interactive demo with sample participants
- Test role management and permissions
- Explore all UI features

### 2. Enhanced Meeting Demo
**Route**: `/enhanced-meeting-demo`
- Complete meeting interface simulation
- Configure meeting settings
- Test all meeting features

## Development Setup

### Prerequisites
- AWS Chime SDK JS v3.28.0+
- Serverless backend deployed
- CORS proxy running (development)

### Environment Variables
```bash
# AWS Chime SDK
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Serverless API
SERVERLESS_API_BASE=http://localhost:8082/api  # Development
SERVERLESS_API_BASE=https://your-api-gateway-url/Prod  # Production
```

### Running the Demos

1. **Start development servers**:
   ```bash
   npm run dev:serverless
   ```

2. **Start CORS proxy**:
   ```bash
   node cors-proxy.cjs
   ```

3. **Access demos**:
   - Participant List: `http://localhost:8080/participant-demo`
   - Enhanced Meeting: `http://localhost:8080/enhanced-meeting-demo`

## Future Enhancements

### Planned Features
1. **Waiting Room**: Approve/deny participant entry
2. **Chat Integration**: Real-time messaging
3. **Recording**: Meeting recording with participant consent
4. **Analytics**: Participant engagement metrics
5. **Breakout Rooms**: Sub-meeting functionality

### Technical Improvements
1. **WebSocket Integration**: Real-time updates via WebSocket
2. **Offline Support**: Graceful handling of connection loss
3. **Performance Optimization**: Virtual scrolling for large participant lists
4. **Accessibility**: Enhanced screen reader support
5. **Mobile Optimization**: Responsive design for mobile devices

## Troubleshooting

### Common Issues

1. **Event Listeners Not Working**
   - Ensure Chime SDK is properly initialized
   - Check browser console for errors
   - Verify meeting session is active

2. **Participant Updates Not Reflecting**
   - Check ParticipantContext state
   - Verify event listener callbacks
   - Ensure proper cleanup on unmount

3. **Audio/Video Issues**
   - Check browser permissions
   - Verify device selection
   - Test with different browsers

### Debug Mode

Enable debug logging by setting:
```typescript
const logger = new ConsoleLogger('ChimeSDKServerless', LogLevel.DEBUG);
```

## API Reference

### Participant Interface
```typescript
interface Participant {
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
```

### ParticipantContext Methods
```typescript
const {
  participants,
  addParticipant,
  removeParticipant,
  updateParticipant,
  muteParticipant,
  unmuteParticipant,
  removeParticipantFromMeeting,
  promoteToCoHost,
  demoteFromCoHost,
  muteAllParticipants,
  muteAllExceptHost,
  isHost,
  isCoHost,
} = useParticipants();
```

## Conclusion

The Chime SDK integration provides a robust foundation for real-time video conferencing with comprehensive participant management. The modular architecture allows for easy extension and customization while maintaining high performance and reliability.
