import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mic, MicOff, Video, VideoOff, CheckCircle, XCircle } from 'lucide-react';

export default function MediaTest() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeMedia();
    listDevices();
  }, []);

  const initializeMedia = async () => {
    try {
      setError(null);
      
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      // Display video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setError('Failed to access camera and microphone. Please check permissions.');
    }
  };

  const listDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error('Error listing devices:', error);
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const retryConnection = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
    initializeMedia();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Media Device Test</h1>
        <p className="text-gray-600">
          Test camera and microphone access for video meetings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Video Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Camera Preview
            </CardTitle>
            <CardDescription>
              Your camera feed should appear below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            ) : isConnected ? (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                />
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Camera connected</span>
                </div>
              </div>
            ) : (
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  <p className="text-gray-600">Connecting...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Media Controls</CardTitle>
            <CardDescription>
              Test microphone and camera controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Microphone</span>
              <Button
                variant={isAudioMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMute}
                disabled={!isConnected}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isAudioMuted ? 'Muted' : 'Unmuted'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span>Camera</span>
              <Button
                variant={!isVideoEnabled ? "destructive" : "outline"}
                size="sm"
                onClick={toggleVideo}
                disabled={!isConnected}
              >
                {!isVideoEnabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                {!isVideoEnabled ? 'Disabled' : 'Enabled'}
              </Button>
            </div>

            <div className="pt-4">
              <Button onClick={retryConnection} className="w-full">
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Devices</CardTitle>
          <CardDescription>
            List of detected media devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {devices.map((device, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{device.label || `Device ${index + 1}`}</p>
                  <p className="text-sm text-gray-500">{device.kind}</p>
                </div>
                <span className="text-xs text-gray-400">{device.deviceId.slice(0, 8)}...</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. Allow camera and microphone permissions when prompted</p>
            <p>2. You should see your camera feed in the preview</p>
            <p>3. Test the mute/unmute and video enable/disable buttons</p>
            <p>4. Check that the device list shows your available cameras and microphones</p>
            <p>5. If you see errors, try refreshing the page or checking browser permissions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
