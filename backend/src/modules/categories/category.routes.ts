import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as ctrl from "./category.controller";

const router = Router();

router.get("/", asyncHandler(ctrl.listCategories));
router.get("/:idOrSlug", asyncHandler(ctrl.getCategory));

router.post("/", requireAuth, requireRole("admin"), asyncHandler(ctrl.createCategory));
router.put("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.updateCategory));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(ctrl.deleteCategory));

export default router;
