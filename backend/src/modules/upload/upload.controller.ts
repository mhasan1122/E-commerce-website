import { Request, Response } from "express";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) throw ApiError.badRequest("No image file provided");

  const url = `${env.serverUrl}/uploads/${req.file.filename}`;
  res.status(201).json({ success: true, url, filename: req.file.filename });
}
