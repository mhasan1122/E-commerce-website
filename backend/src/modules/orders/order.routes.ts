import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as ctrl from "./order.controller";

const router = Router();

// Admin routes (register before /:id to avoid matching)
router.get(
  "/admin/stats",
  requireAuth,
  requireRole("admin"),
  asyncHandler(ctrl.adminStats)
);
router.get("/admin/all", requireAuth, requireRole("admin"), asyncHandler(ctrl.listAllOrders));
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin"),
  asyncHandler(ctrl.updateOrderStatus)
);

// User routes
router.post("/", requireAuth, asyncHandler(ctrl.createOrder));
router.get("/my", requireAuth, asyncHandler(ctrl.listMyOrders));
router.get("/:id", requireAuth, asyncHandler(ctrl.getOrder));

export default router;
