import jwt from "jsonwebtoken";
export const SECRET = "SECr3t"; // This should be in an environment variable in a real application
import { Request, Response, NextFunction } from "express";
import { string } from "zod";

export const authenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    // console.log(token);
    jwt.verify(token, SECRET, (err, payload) => {
      if (err) {
        return res.sendStatus(403);
      }
      if (!payload) {
        return res.sendStatus(403);
      }
      if (typeof payload === "string") {
        return res.sendStatus(403);
      }
      // console.log(payload.username);
      req.headers["userName"] = payload.username;
      // console.log(req.headers["userName"]);
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
