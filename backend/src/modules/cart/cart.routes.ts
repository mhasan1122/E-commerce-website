import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import * as ctrl from "./cart.controller";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(ctrl.getCart));
router.post("/items", asyncHandler(ctrl.addToCart));
router.put("/items/:itemId", asyncHandler(ctrl.updateCartItem));
router.delete("/items/:itemId", asyncHandler(ctrl.removeCartItem));
router.delete("/", asyncHandler(ctrl.clearCart));

export default router;
