import { Request } from "express";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (_req: Request, _file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (_req: Request, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });