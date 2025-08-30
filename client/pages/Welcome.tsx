import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">TIN Connect</h1>
          </div>
          
          {/* Welcome Message */}
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl font-medium text-blue-600">
              Welcome to TIN Connect!
            </h2>
            <p className="text-xl text-gray-500 max-w-lg mx-auto">
              Easily connect with your friends, family and co-workers.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4 w-full max-w-md mx-auto">
            <Link to="/join-meeting" className="block">
              <Button 
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium rounded-2xl"
                size="lg"
              >
                Join a meeting
              </Button>
            </Link>
            
            <Link to="/auth" className="block">
              <Button 
                className="w-full h-16 bg-teal-500 hover:bg-teal-600 text-white text-xl font-medium rounded-2xl"
                size="lg"
              >
                Sign in
              </Button>
            </Link>
          </div>
          
          {/* Sign Up Link */}
          <div className="mt-8">
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link to="/auth?mode=signup" className="text-blue-600 font-medium hover:text-blue-700">
                Sign up for free.
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="pb-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Available for download:</p>
          <div className="flex justify-center items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded px-4 py-2 text-sm text-gray-600">
              App Store
            </div>
            <div className="h-10 bg-gray-200 rounded px-4 py-2 text-sm text-gray-600">
              Google Play
            </div>
            <div className="h-10 bg-gray-200 rounded px-4 py-2 text-sm text-gray-600">
              Windows Store
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
