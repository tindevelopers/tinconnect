import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Video } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

export default function ChimeTest() {
  const [connectionTest, setConnectionTest] = useState<TestResult | null>(null);
  const [meetingTest, setMeetingTest] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setConnectionTest(null);
    
    try {
      const response = await fetch('/api/chime/test');
      const result = await response.json();
      
      setConnectionTest({
        success: result.success,
        message: result.data?.message || result.error || 'Unknown error',
        data: result.data
      });
    } catch (error) {
      setConnectionTest({
        success: false,
        message: error instanceof Error ? error.message : 'Network error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testMeetingCreation = async () => {
    setLoading(true);
    setMeetingTest(null);
    
    try {
      const response = await fetch('/api/chime/test-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      
      setMeetingTest({
        success: result.success,
        message: result.success ? 'Test meeting created successfully' : result.error || 'Unknown error',
        data: result.data
      });
    } catch (error) {
      setMeetingTest({
        success: false,
        message: error instanceof Error ? error.message : 'Network error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chime SDK Integration Test</h1>
        <p className="text-gray-600">
          Test your AWS Chime SDK integration and environment variables.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Connection Test
            </CardTitle>
            <CardDescription>
              Test AWS credentials and Chime SDK connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testConnection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>

            {connectionTest && (
              <Alert className={connectionTest.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {connectionTest.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription className={connectionTest.success ? 'text-green-800' : 'text-red-800'}>
                    {connectionTest.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Meeting Creation Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Meeting Creation Test
            </CardTitle>
            <CardDescription>
              Test creating a Chime meeting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testMeetingCreation} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Test Meeting'
              )}
            </Button>

            {meetingTest && (
              <Alert className={meetingTest.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {meetingTest.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription className={meetingTest.success ? 'text-green-800' : 'text-red-800'}>
                    {meetingTest.message}
                  </AlertDescription>
                </div>
                {meetingTest.success && meetingTest.data && (
                  <div className="mt-2 text-sm">
                    <p><strong>Meeting ID:</strong> {meetingTest.data.Meeting?.MeetingId}</p>
                    <p><strong>External Meeting ID:</strong> {meetingTest.data.Meeting?.ExternalMeetingId}</p>
                  </div>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Environment Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>
            Current environment and configuration details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Environment Variables</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>AWS Region:</span>
                  <Badge variant="outline">us-east-1</Badge>
                </div>
                <div className="flex justify-between">
                  <span>AWS Access Key:</span>
                  <Badge variant="outline">
                    {process.env.NODE_ENV === 'production' ? 'Production' : 'Preview'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge variant="outline">
                    {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">API Endpoints</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Connection Test:</span>
                  <code className="text-xs bg-gray-100 px-1 rounded">GET /api/chime/test</code>
                </div>
                <div className="flex justify-between">
                  <span>Meeting Test:</span>
                  <code className="text-xs bg-gray-100 px-1 rounded">POST /api/chime/test-meeting</code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
