import {Request, Response} from "express";

export async function healthHandler(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "empowerher-functions",
    version: "1.0.0",
  });
}

