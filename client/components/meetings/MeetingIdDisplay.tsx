import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface MeetingIdDisplayProps {
  meetingId: string;
  meetingTitle?: string;
  onCopy?: (meetingId: string) => void;
  className?: string;
}

const MeetingIdDisplay: React.FC<MeetingIdDisplayProps> = ({
  meetingId,
  meetingTitle = 'Meeting',
  onCopy,
  className
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);
      setCopied(true);
      onCopy?.(meetingId);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy meeting ID:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = meetingId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meetingTitle,
          text: `Join my meeting: ${meetingId}`,
          url: `${window.location.origin}/start-meeting?join=${meetingId}`
        });
      } catch (error) {
        console.error('Error sharing:', error);
        setShowShareDialog(true);
      }
    } else {
      setShowShareDialog(true);
    }
  };

  const generateMeetingLink = () => {
    return `${window.location.origin}/start-meeting?join=${meetingId}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="secondary">{meetingTitle}</Badge>
          Meeting ID
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            value={meetingId}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        {showShareDialog && (
          <div className="space-y-2">
            <Label htmlFor="meeting-link">Meeting Link</Label>
            <div className="flex items-center gap-2">
              <Input
                id="meeting-link"
                value={generateMeetingLink()}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generateMeetingLink());
                  setShowShareDialog(false);
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Share this meeting ID or link with others to invite them to join your meeting.
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingIdDisplay;
