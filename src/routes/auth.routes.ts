import { Router } from "express";
import { onboardUser } from "../controllers/auth.controller";

const router = Router();

router.post("/onboard", (req, res, next) => {
  onboardUser(req, res).catch(next);
});

export default router;
