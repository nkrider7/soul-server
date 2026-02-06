import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  syncUser,
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/auth.controller";
import { TryCatch } from "../middleware/error.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", (req, res, next) => {
  TryCatch(register)(req, res, next);
});
router.post("/login", (req, res, next) => {
  TryCatch(login)(req, res, next);
});
router.post("/token/refresh", (req, res, next) => {
  TryCatch(refreshToken)(req, res, next);
});
router.post("/logout", (req, res, next) => {
  TryCatch(logout)(req, res, next);
});
router.post("/forgot-password", (req, res, next) => {
  TryCatch(forgotPassword)(req, res, next);
});
router.post("/reset-password", (req, res, next) => {
  TryCatch(resetPassword)(req, res, next);
});

// Protected routes
router.post("/sync", (req, res, next) => {
  authMiddleware(req, res, () => {
    TryCatch(syncUser)(req, res, next);
  });
});
router.get("/me", (req, res, next) => {
  authMiddleware(req, res, () => {
    TryCatch(getCurrentUser)(req, res, next);
  });
});
router.put("/me", (req, res, next) => {
  authMiddleware(req, res, () => {
    TryCatch(updateCurrentUser)(req, res, next);
  });
});

export default router;
