import { Router } from "express";
import { upload } from "../middleware/multer.middleware";
import { createCharacter, deleteCharacter, getCharacter, getCharacters, updateCharacter } from "../controllers/character.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", (req, res, next) => {
  authMiddleware(req, res, next);
}, (req, res) => {
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "fullImage", maxCount: 1 },
    { name: "bgImage", maxCount: 1 },
    { name: "animatedImage", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.log(err)
      return res.status(400).json({ error: "Failed to upload images" });
    }
    createCharacter(req, res);
  });
});
router.put("/:id", (req, res, next) => {
  authMiddleware(req, res, next);
}, (req, res) => {
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "fullImage", maxCount: 1 },
    { name: "bgImage", maxCount: 1 },
    { name: "animatedImage", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.log(err)
      return res.status(400).json({ error: "Failed to upload images" });
    }
    updateCharacter(req, res);
  });
});
router.delete("/:id", (req, res, next) => {
  authMiddleware(req, res, next);
}, (req, res) => {
  deleteCharacter(req, res);
});
router.get("/:id", (req, res) => { getCharacter(req, res) });
router.get("/", (req, res) => {
  getCharacters(req, res);
});
export default router;