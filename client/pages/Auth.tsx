import React, { useState, useEffect } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { useNavigate, useSearchParams } from 'react-router-dom';

type AuthMode = 'login' | 'signup';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check URL parameters for mode
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const switchToSignUp = () => setMode('signup');
  const switchToSignIn = () => setMode('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">TIN Connect</h1>
          <p className="mt-2 text-sm text-gray-600">
            Multi-tenant video platform
          </p>
        </div>
        
        {mode === 'login' ? (
          <LoginForm 
            onSuccess={handleSuccess}
            onSwitchToSignUp={switchToSignUp}
          />
        ) : (
          <SignUpForm 
            onSuccess={handleSuccess}
            onSwitchToSignIn={switchToSignIn}
          />
        )}
      </div>
    </div>
  );
}
