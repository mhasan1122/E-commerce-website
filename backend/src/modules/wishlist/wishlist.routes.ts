import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./wishlist.controller";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(ctrl.getWishlist));
router.post("/", asyncHandler(ctrl.addToWishlist));
router.delete("/:productId", asyncHandler(ctrl.removeFromWishlist));

export default router;
