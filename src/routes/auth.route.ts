import { Router } from "express";
import { loginUser, onboardUser, signupUser } from "../controllers/auth.controller";

const router = Router();

router.post("/onboard", (req, res, next) => {
  onboardUser(req, res).catch(next);
});

router.post("/login", (req, res, next) => {
  loginUser(req, res).catch(next);
});
router.post("/signup", (req, res, next) => {
  signupUser(req, res).catch(next);
});

export default router;
