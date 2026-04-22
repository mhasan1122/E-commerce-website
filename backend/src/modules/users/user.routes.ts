import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as ctrl from "./user.controller";

const router = Router();

// Self
router.put("/me/profile", requireAuth, asyncHandler(ctrl.updateProfile));

// Admin-only
router.get("/", requireAuth, requireRole("admin"), asyncHandler(ctrl.listUsers));
router.get("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.getUser));
router.put("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.adminUpdateUser));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.deleteUser));

export default router;
