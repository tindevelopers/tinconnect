import { RequestHandler } from "express";

export const handlePing: RequestHandler = (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "ping";
  res.json({ message: ping });
};
