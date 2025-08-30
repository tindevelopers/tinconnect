import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Debug logging
console.log("Index.tsx is loading...");

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new welcome page
    navigate('/welcome', { replace: true });
  }, [navigate]);

  console.log("Index component rendering...");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">TIN Connect</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
