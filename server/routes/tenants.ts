import { RequestHandler } from "express";
import { z } from "zod";
import { TenantService } from "../services/tenant-service.js";
import { ApiResponse, CreateTenantRequest, Tenant, User, CreateUserRequest } from "@shared/api";

const tenantService = new TenantService();

// Validation schemas
const createTenantSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  domain: z.string().min(1, "Domain is required").regex(/^[a-zA-Z0-9.-]+$/, "Invalid domain format"),
  settings: z.object({
    maxParticipants: z.number().min(1).max(1000).optional(),
    recordingEnabled: z.boolean().optional(),
    chatEnabled: z.boolean().optional(),
    screenShareEnabled: z.boolean().optional(),
  }).optional(),
});

const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["admin", "user", "guest"]).optional(),
});

export const createTenant: RequestHandler = async (req, res) => {
  try {
    const validatedData = createTenantSchema.parse(req.body);
    const tenant = await tenantService.createTenant(validatedData);
    
    const response: ApiResponse<Tenant> = {
      success: true,
      data: tenant,
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating tenant:", error);
    
    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.errors[0].message,
      };
      return res.status(400).json(response);
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tenant",
    };
    res.status(500).json(response);
  }
};

export const getTenant: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = await tenantService.getTenant(tenantId);
    
    if (!tenant) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Tenant not found",
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<Tenant> = {
      success: true,
      data: tenant,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error getting tenant:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get tenant",
    };
    res.status(500).json(response);
  }
};

export const getTenantByDomain: RequestHandler = async (req, res) => {
  try {
    const { domain } = req.params;
    const tenant = await tenantService.getTenantByDomain(domain);
    
    if (!tenant) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Tenant not found",
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<Tenant> = {
      success: true,
      data: tenant,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error getting tenant by domain:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get tenant",
    };
    res.status(500).json(response);
  }
};

export const updateTenant: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const updates = req.body;
    
    // Remove immutable fields
    delete updates.id;
    delete updates.createdAt;
    
    const tenant = await tenantService.updateTenant(tenantId, updates);
    
    const response: ApiResponse<Tenant> = {
      success: true,
      data: tenant,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error updating tenant:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update tenant",
    };
    res.status(500).json(response);
  }
};

export const deleteTenant: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req.params;
    await tenantService.deleteTenant(tenantId);
    
    const response: ApiResponse<null> = {
      success: true,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error deleting tenant:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete tenant",
    };
    res.status(500).json(response);
  }
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const validatedData = createUserSchema.parse(req.body);
    
    const user = await tenantService.createUser({
      ...validatedData,
      tenantId,
    });
    
    const response: ApiResponse<User> = {
      success: true,
      data: user,
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating user:", error);
    
    if (error instanceof z.ZodError) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.errors[0].message,
      };
      return res.status(400).json(response);
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
    res.status(500).json(response);
  }
};

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const users = await tenantService.getTenantUsers(tenantId);
    
    const response: ApiResponse<User[]> = {
      success: true,
      data: users,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error getting users:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get users",
    };
    res.status(500).json(response);
  }
};

export const getUser: RequestHandler = async (req, res) => {
  try {
    const { tenantId, userId } = req.params;
    const user = await tenantService.getUser(tenantId, userId);
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User not found",
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<User> = {
      success: true,
      data: user,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error getting user:", error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
    res.status(500).json(response);
  }
};
