import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";

const router: Router = Router();
const prisma = new PrismaClient();

const JWT_SECRET =
  process.env.JWT_SECRET || "dev_secret_key_change_in_production";

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { username, email, password } = req.body as {
        username: string;
        email: string;
        password: string;
      };

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
      });
      if (existingUser) {
        if (existingUser.username === username)
          return res.status(400).json({ message: "Username already taken" });
        if (existingUser.email === email)
          return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { username, email, password: hashedPassword },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "24h",
      });

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error("Registration error:", err);
      return res
        .status(500)
        .json({ message: "Server error during registration" });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login a user and return a JWT
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const secret = process.env.JWT_SECRET!;
      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "24h" });

      return res.json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Server error during login" });
    }
  }
);

export default router;
