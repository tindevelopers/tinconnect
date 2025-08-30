// Simple API test utility for debugging
export const testApiEndpoints = async () => {
  console.log("🔍 Testing API endpoints...");
  
  try {
    // Test basic ping
    console.log("Testing /api/ping...");
    const pingResponse = await fetch('/api/ping');
    const pingData = await pingResponse.json();
    console.log("✅ Ping successful:", pingData);

    // Test demo tenant endpoints with fallback
    const tenantId = 'demo-tenant';
    
    // Test get meetings endpoint
    console.log(`Testing /api/tenants/${tenantId}/meetings...`);
    const meetingsResponse = await fetch(`/api/tenants/${tenantId}/meetings`);
    
    if (meetingsResponse.ok) {
      const meetingsData = await meetingsResponse.json();
      console.log("✅ Meetings endpoint successful:", meetingsData);
    } else {
      console.log("⚠️ Meetings endpoint failed:", meetingsResponse.status, await meetingsResponse.text());
    }

    // Test get users endpoint
    console.log(`Testing /api/tenants/${tenantId}/users...`);
    const usersResponse = await fetch(`/api/tenants/${tenantId}/users`);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log("✅ Users endpoint successful:", usersData);
    } else {
      console.log("⚠️ Users endpoint failed:", usersResponse.status, await usersResponse.text());
    }

  } catch (error) {
    console.error("❌ API test failed:", error);
  }
};

// Call this in development mode
if (import.meta.env.DEV) {
  console.log("🚀 Development mode detected, API tests available");
  // Expose to window for manual testing
  (window as any).testApiEndpoints = testApiEndpoints;
}
