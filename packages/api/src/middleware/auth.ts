import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const JWT_SECRET =
  process.env.NODE_ENV === "test"
    ? process.env.JWT_SECRET || "test_secret"
    : process.env.JWT_SECRET || "dev_secret_key_change_in_production";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authentication required. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication required. Invalid token format." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }

    console.error("Authentication error:", error);
    return res
      .status(500)
      .json({ message: "Server error during authentication." });
  }
};
