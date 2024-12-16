import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { User } from "./userTypes";
import { config } from "../config/config";
import { sign } from "jsonwebtoken";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    console.log("All fields are required");
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    const user = await userModel.findOne({ email });
    if (user) {
      return next(createHttpError(400, "User already exists"));
    }
  } catch (error) {
    console.log("Error creating user", error);

    return next(createHttpError(400, "Error while getting user"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let newUser: User;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    console.log("Error while creating user", error);

    return next(createHttpError(400, "Error while creating user"));
  }

  try {
    // Token generation JWT
    const token = sign({ sub: newUser._id }, config.jwt_secret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
    // Response
    res.status(201).json({ accessToken: token });
  } catch (error) {
    console.log("Error while creating token: ", error);

    return next(createHttpError(500, "Error while signing the jwt token"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(createHttpError(400, "User not found"));
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return next(createHttpError(400, "Invalid credentials"));
  }
  const token = sign({ sub: user._id }, config.jwt_secret as string, {
    expiresIn: "7d",
    algorithm: "HS256",
  });
  res.json({ accessToken: token });
};

export { createUser, loginUser };
