import { Router } from "express";
import { createChallenge, getChallenge, getChallenges, updateChallenge } from "../controllers/challenege.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await createChallenge(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.patch("/:id", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await updateChallenge(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.get("/", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      getChallenges(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.get("/:id", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await getChallenge(req, res);
    } catch (error) {
      next(error);
    }
  });
});

export default router;
