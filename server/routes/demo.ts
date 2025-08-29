import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";

export const handleDemo: RequestHandler = (_req, res) => {
  const response: DemoResponse = {
    message: "Hello from the multi-tenant video platform!",
    timestamp: new Date().toISOString(),
  };
  res.json(response);
};
