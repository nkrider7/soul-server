import { Router } from "express";
import { createQuest, deleteQuest, getAllQuests, getQuest, updateQuest } from "../controllers/quest.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await createQuest(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.patch("/:id", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await updateQuest(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.delete("/:id", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await deleteQuest(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.get("/:id", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await getQuest(req, res);
    } catch (error) {
      next(error);
    }
  });
});
router.get("/", async (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      await getAllQuests(req, res);
    } catch (error) {
      next(error);
    }
  });
});

export default router;
