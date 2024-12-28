import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export default (req: Request, res: Response, next: NextFunction) => {
  const token: string | undefined = req.headers.authorization;
  if (token) {
    try {
      const decoded: any = jwt.verify(token, "eyJhbGciOi");
      res.locals.jwt = decoded;
    } catch (err) {
      return res.sendStatus(401);
    }
  } else return res.sendStatus(401);

  next();
};
