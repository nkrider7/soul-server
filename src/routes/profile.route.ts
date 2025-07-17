import { Router } from "express";
import { createProfile, getProfile, updateProfile } from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", (req, res, next) => {
  authMiddleware(req, res, () => {
    getProfile(req, res).catch(next);
  });
});
router.post("/", (req, res, next) => {
  authMiddleware(req, res, () => {
    createProfile(req, res).catch(next);
  });
});
router.patch("/", (req, res, next) => {
  authMiddleware(req, res, () => {
    updateProfile(req, res).catch(next);
  });
});

export default router;
