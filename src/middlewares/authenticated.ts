import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}

const authenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Middleware is Processing Request");

  const token = req.header("Authorization");
  if (!token) {
    return next(createHttpError(401, "Unauthorized"));
  }
  const parsedToken = token.split(" ")[1];

  try {
    const decodedToken = verify(parsedToken, config.jwt_secret as string);
    const _req = req as AuthRequest;

    _req.userId = decodedToken.sub as string;
  } catch (error) {
    console.log("Error verifying token", error);

    return next(createHttpError(401, "Invalid Token"));
  }

  // console.log("decoded token: ", decodedToken);

  next();
};

export default authenticated;
