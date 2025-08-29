import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Users,
  Shield,
  Zap,
  Globe,
  Phone,
  MessageSquare,
  Monitor,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Calendar,
  Lock,
  Cloud,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TIN CONNECT
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#contact"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost">Sign In</Button>
            <Button>
              <a href="/dashboard">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Zap className="w-3 h-3 mr-1" />
          Powered by Amazon Chime SDK
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 bg-clip-text text-transparent">
          Enterprise Video
          <br />
          <span className="text-blue-600">Conferencing Platform</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Build secure, scalable video meetings for your organization.
          Multi-tenant architecture with enterprise-grade features and seamless
          mobile experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="text-lg px-8 py-6">
            <a href="/dashboard" className="flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Start Free Trial
            </a>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Demo
          </Button>
        </div>

        {/* Hero Visual */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">
            <div className="bg-gray-900 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-white text-sm">TIN CONNECT Conference</div>
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <Users className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Video Conference Interface</p>
                <p className="text-sm text-gray-500 mt-2">
                  Multi-participant view with HD quality
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for{" "}
              <span className="text-blue-600">professional meetings</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built on Amazon Chime SDK with enterprise-grade security and
              scalability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Video className="w-8 h-8 text-blue-600" />,
                title: "HD Video & Audio",
                description:
                  "Crystal clear video calls with adaptive streaming and noise cancellation",
              },
              {
                icon: <Users className="w-8 h-8 text-purple-600" />,
                title: "Multi-Tenant Support",
                description:
                  "Isolated organizations with custom branding and administrative controls",
              },
              {
                icon: <Shield className="w-8 h-8 text-green-600" />,
                title: "Enterprise Security",
                description:
                  "End-to-end encryption, compliance ready, and secure data handling",
              },
              {
                icon: <MessageSquare className="w-8 h-8 text-indigo-600" />,
                title: "Real-time Chat",
                description:
                  "Integrated messaging with file sharing and emoji reactions",
              },
              {
                icon: <Monitor className="w-8 h-8 text-red-600" />,
                title: "Screen Sharing",
                description:
                  "Share your screen or specific applications with participants",
              },
              {
                icon: <Cloud className="w-8 h-8 text-teal-600" />,
                title: "Cloud Recording",
                description:
                  "Automatic recording with secure cloud storage and sharing",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Scale & Performance
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Leveraging Amazon's global infrastructure for reliable,
              low-latency video experiences
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              {
                number: "99.9%",
                label: "Uptime SLA",
                icon: <Zap className="w-6 h-6 mx-auto mb-2" />,
              },
              {
                number: "<100ms",
                label: "Latency",
                icon: <Globe className="w-6 h-6 mx-auto mb-2" />,
              },
              {
                number: "1000+",
                label: "Participants",
                icon: <Users className="w-6 h-6 mx-auto mb-2" />,
              },
              {
                number: "24/7",
                label: "Support",
                icon: <Phone className="w-6 h-6 mx-auto mb-2" />,
              },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                {stat.icon}
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Easy Integration &{" "}
              <span className="text-blue-600">Mobile Ready</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              React + Vite architecture optimized for both web and mobile
              deployment
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Amazon Chime SDK Integration
                  </h3>
                  <p className="text-gray-600">
                    Seamless integration with Amazon's battle-tested video
                    infrastructure
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Progressive Web App
                  </h3>
                  <p className="text-gray-600">
                    Mobile-optimized with offline capabilities and native app
                    feel
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Multi-Tenant Architecture
                  </h3>
                  <p className="text-gray-600">
                    Isolated environments for different organizations with
                    shared infrastructure
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="bg-gray-900 text-white p-4 rounded-lg mb-6">
                <div className="text-sm text-green-400 mb-2">
                  // Integration Example
                </div>
                <div className="text-sm font-mono">
                  <div className="text-blue-300">import</div>
                  <div className="ml-2">ChimeSDK</div>
                  <div className="text-blue-300">from</div>
                  <div className="ml-2">'amazon-chime-sdk'</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">Ready for:</div>
                <div className="grid grid-cols-2 gap-4">
                  <Badge variant="secondary">React Native</Badge>
                  <Badge variant="secondary">Capacitor</Badge>
                  <Badge variant="secondary">PWA</Badge>
                  <Badge variant="secondary">Web Deploy</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to build your video platform?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get started with our comprehensive development kit and Amazon Chime
            SDK integration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              <a href="/dashboard" className="flex items-center">
                Start Building Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">TIN CONNECT</span>
              </div>
              <p className="text-gray-400">
                Enterprise video conferencing platform built on Amazon Chime SDK
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TIN CONNECT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
