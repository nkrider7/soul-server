import { Router } from "express";
import { createQuest, deleteQuest, getAllQuests, getQuest, updateQuest } from "../controllers/quest.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/:challengeId", async (req, res, next) => {
  // authMiddleware(req, res, async () => {
    try {
      await createQuest(req, res);
    } catch (error) {
      next(error);
    }
  // });
});
router.patch("/:challengeId/:id", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await updateQuest(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.delete("/:challengeId/:id", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await deleteQuest(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.get("/:challengeId/:id", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await getQuest(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.get("/:challengeId", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await getAllQuests(req, res);
    } catch (error) {
      next(error);
    }
  });
});

export default router;
