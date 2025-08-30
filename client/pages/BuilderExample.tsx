import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BuilderExample() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Builder.io Integration</h1>
        <p className="text-gray-600">
          Builder.io integration is set up and ready for use.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Builder.io Configuration</CardTitle>
          <CardDescription>
            Environment variables and setup status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Environment Variables</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ VITE_BUILDER_API_KEY - Configured</li>
                <li>✅ BUILDER_API_KEY - Configured</li>
                <li>✅ BUILDER_MODEL_NAME - Set to "page"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">API Endpoints</h3>
              <ul className="space-y-1 text-sm">
                <li>GET /api/builder/content - Get content by model</li>
                <li>GET /api/builder/content/url - Get content by URL</li>
                <li>GET /api/builder/content/:id - Get content by ID</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Next Steps</h3>
              <ul className="space-y-1 text-sm">
                <li>1. Create content in Builder.io dashboard</li>
                <li>2. Use BuilderPage component in your pages</li>
                <li>3. Test the integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
