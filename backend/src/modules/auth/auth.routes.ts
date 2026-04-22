import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as ctrl from "./auth.controller";

const router = Router();

router.post("/register", asyncHandler(ctrl.register));
router.post("/login", asyncHandler(ctrl.login));
router.get("/me", requireAuth, asyncHandler(ctrl.me));

// Admin-only account creation
router.post(
  "/admin/create-user",
  requireAuth,
  requireRole("admin"),
  asyncHandler(ctrl.adminCreateUser)
);

export default router;
