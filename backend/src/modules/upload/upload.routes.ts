import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { uploadSingle } from "../../middleware/upload";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadImage } from "./upload.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  (req: Request, res: Response, next: NextFunction) => {
    uploadSingle(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  asyncHandler(uploadImage)
);

export default router;
