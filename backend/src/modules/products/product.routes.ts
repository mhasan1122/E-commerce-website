import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as ctrl from "./product.controller";

const router = Router();

router.get("/", asyncHandler(ctrl.listProducts));
router.get("/:idOrSlug", asyncHandler(ctrl.getProduct));

router.post("/", requireAuth, requireRole("admin"), asyncHandler(ctrl.createProduct));
router.put("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.updateProduct));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.deleteProduct));

export default router;
