import { Request, Response, NextFunction } from "express";

export const TryCatch = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

