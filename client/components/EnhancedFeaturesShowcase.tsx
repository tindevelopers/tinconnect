import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { 
  Video, 
  Users, 
  MessageSquare, 
  Monitor, 
  Mic, 
  Settings,
  Smartphone,
  Tablet,
  Computer
} from 'lucide-react';

export const EnhancedFeaturesShowcase: React.FC = () => {
  const features = [
    {
      title: 'Enhanced Dashboard',
      description: 'Beautiful user profile with availability status, quick meeting controls, and upcoming meetings.',
      route: '/improved-dashboard',
      icon: Users,
      highlights: ['User Profile', 'Quick Actions', 'Meeting Overview', 'Chat Panel']
    },
    {
      title: 'Advanced Video Meeting',
      description: 'Professional meeting interface with participant tiles, real-time chat, and comprehensive controls.',
      route: '/enhanced-meeting',
      icon: Video,
      highlights: ['Participant Grid', 'Active Speaker', 'Screen Recording', 'Chat Integration']
    }
  ];

  const capabilities = [
    {
      icon: Video,
      title: 'HD Video Conferencing',
      description: 'Crystal clear video with participant management'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Integrated messaging with emoji support'
    },
    {
      icon: Monitor,
      title: 'Screen Sharing',
      description: 'Share your screen with meeting participants'
    },
    {
      icon: Mic,
      title: 'Audio Controls',
      description: 'Advanced microphone and speaker controls'
    },
    {
      icon: Settings,
      title: 'Meeting Controls',
      description: 'Recording, mute, camera, and more'
    },
    {
      icon: Users,
      title: 'Participant Management',
      description: 'See who\'s speaking and manage attendees'
    }
  ];

  const responsiveFeatures = [
    { icon: Smartphone, label: 'Mobile Optimized' },
    { icon: Tablet, label: 'Tablet Friendly' },
    { icon: Computer, label: 'Desktop Enhanced' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          🎉 Enhanced Meeting Experience
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900">
          Professional Video Conferencing
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience our redesigned meeting interface with advanced features, 
          intuitive controls, and seamless collaboration tools.
        </p>
      </div>

      {/* Main Features */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {feature.highlights.map((highlight) => (
                  <Badge key={highlight} variant="outline" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
              <Link to={feature.route}>
                <Button className="w-full">
                  Experience {feature.title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Capabilities Grid */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">Key Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((capability) => (
            <div key={capability.title} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <capability.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{capability.title}</h3>
                <p className="text-sm text-gray-600">{capability.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Design */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Fully Responsive Design</CardTitle>
          <CardDescription className="text-center">
            Optimized for all devices and screen sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-8">
            {responsiveFeatures.map((feature) => (
              <div key={feature.label} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{feature.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4 bg-blue-600 text-white p-8 rounded-2xl">
        <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
        <p className="text-xl opacity-90">
          Try our enhanced meeting experience today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/improved-dashboard">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Open Dashboard
            </Button>
          </Link>
          <Link to="/join-meeting">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              Join Meeting
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
