import express from "express";
import { authenticate } from "./../auth/verifyToken.js";
import { getCheckoutSession } from "../controllers/bookingController.js";
import { get } from "mongoose";

const router = express.Router();
router.post("/checkout-session/:doctorId", authenticate, getCheckoutSession);
export default router;
