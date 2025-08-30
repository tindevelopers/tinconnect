import React from 'react';
import { Link } from 'react-router-dom';

// Debug logging
console.log('Index.tsx is loading...');

const Index: React.FC = () => {
  console.log('Index component rendering...');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">TIN Connect</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/welcome"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Join Meeting
              </Link>
              <Link
                to="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Professional</span>
              <span className="block text-blue-600">TIN Video Conferencing</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Multi-tenant video conferencing platform with real-time collaboration features, 
              built for modern teams and organizations.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/auth"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Start Free Trial
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/welcome"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Join Meeting
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need for professional video conferencing
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">🔐</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Multi-tenant Security</h3>
                  <p className="text-sm text-gray-600">Secure tenant isolation with Row Level Security</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">📹</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">HD Video Conferencing</h3>
                  <p className="text-sm text-gray-600">Crystal clear video powered by AWS Chime SDK</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">🗄️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Supabase</h3>
                  <p className="text-sm text-gray-600">PostgreSQL with real-time features</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Technology Stack</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Built with modern technologies
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-blue-600">⚛️</span>
                  </div>
                  <p className="text-xs text-gray-600">React 18</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-blue-600">📘</span>
                  </div>
                  <p className="text-xs text-gray-600">TypeScript</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-blue-600">⚡</span>
                  </div>
                  <p className="text-xs text-gray-600">Vite</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-blue-600">🎨</span>
                  </div>
                  <p className="text-xs text-gray-600">TailwindCSS</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-blue-600">🚀</span>
                  </div>
                  <p className="text-xs text-gray-600">Express.js</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-blue-600">☁️</span>
                  </div>
                  <p className="text-xs text-gray-600">AWS Chime SDK</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">TIN Connect</h3>
              <p className="text-gray-600 mb-4">
                Professional multi-tenant video conferencing platform built for modern teams and organizations.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Technology</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>React 18</li>
                <li>TypeScript</li>
                <li>Express.js</li>
                <li>Amazon Chime SDK</li>
                <li>Supabase</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              © 2024 TIN Connect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
