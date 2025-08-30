import express from "express";
import cors from "cors";
import { config } from "dotenv";

// Import routes
import { handlePing } from "./routes/ping.js";
import { handleDemo } from "./routes/demo.js";

// Import tenant routes
import {
  createTenant,
  getTenant,
  getTenantByDomain,
  updateTenant,
  deleteTenant,
  createUser,
  getUsers,
  getUser,
} from "./routes/tenants.js";

// Import meeting routes
import {
  createMeeting,
  getMeeting,
  getMeetings,
  joinMeeting,
  leaveMeeting,
  endMeeting,
} from "./routes/meetings.js";

// Import Chime test routes
import {
  testChimeConnection,
  createTestMeeting,
} from "./routes/chime-test.js";

config({ path: '.env.local' });
config();

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check routes
  app.get("/api/ping", handlePing);
  app.get("/api/demo", handleDemo);

  // Tenant management routes
  app.post("/api/tenants", createTenant);
  app.get("/api/tenants/:tenantId", getTenant);
  app.get("/api/tenants/domain/:domain", getTenantByDomain);
  app.put("/api/tenants/:tenantId", updateTenant);
  app.delete("/api/tenants/:tenantId", deleteTenant);

  // User management routes
  app.post("/api/tenants/:tenantId/users", createUser);
  app.get("/api/tenants/:tenantId/users", getUsers);
  app.get("/api/tenants/:tenantId/users/:userId", getUser);

  // Meeting management routes
  app.post("/api/tenants/:tenantId/meetings", createMeeting);
  app.get("/api/tenants/:tenantId/meetings", getMeetings);
  app.get("/api/tenants/:tenantId/meetings/:meetingId", getMeeting);
  app.post("/api/tenants/:tenantId/meetings/:meetingId/join", joinMeeting);
  app.post("/api/tenants/:tenantId/meetings/:meetingId/leave", leaveMeeting);
  app.post("/api/tenants/:tenantId/meetings/:meetingId/end", endMeeting);

  // Chime test routes
  app.get("/api/chime/test", testChimeConnection);
  app.post("/api/chime/test-meeting", createTestMeeting);

  return app;
}
