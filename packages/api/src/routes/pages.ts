import { Router, Response } from "express";
import { body, query, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import Bull from "bull";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { Pagination, ScrapeJob } from "@link-scraper/shared";
import { validateUrl } from "../utils/url-validator";

const router: Router = Router();
const prisma = new PrismaClient();

const scrapeQueue = new Bull(
  "scrape-queue",
  process.env.REDIS_URL || "redis://localhost:6379"
);

/**
 * @route   POST /api/pages
 * @desc    Submit a URL for scraping
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  [
    body("url")
      .trim()
      .notEmpty()
      .withMessage("URL is required")
      .isURL({ protocols: ["http", "https"], require_protocol: true })
      .withMessage("Please provide a valid URL with http or https protocol")
      .custom((url) => {
        if (!validateUrl(url)) {
          throw new Error("URL is potentially unsafe or invalid");
        }
        return true;
      }),
  ],
  async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { url } = req.body as { url: string };
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const page = await prisma.page.create({
        data: {
          url,
          userId,
          status: "queued",
          queuedAt: new Date(),
        },
      });

      const job: ScrapeJob = {
        pageId: page.id,
        url,
      };

      await scrapeQueue.add(job, {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      });

      return res.status(202).json({
        message: "URL submitted for scraping",
        page: {
          id: page.id,
          url: page.url,
          status: page.status,
          queuedAt: page.queuedAt,
        },
      });
    } catch (error) {
      console.error("URL submission error:", error);
      return res
        .status(500)
        .json({ message: "Server error during URL submission" });
    }
  }
);

/**
 * @route   GET /api/pages
 * @desc    Get all pages for the authenticated user with pagination
 * @access  Private
 */
router.get(
  "/",
  authenticate,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100")
      .toInt(),
  ],
  async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const totalCount = await prisma.page.count({
        where: { userId },
      });

      const pages = (await prisma.page.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          url: true,
          title: true,
          status: true,
          linkCount: true,
          queuedAt: true,
          startedAt: true,
          finishedAt: true,
          error: true,
          createdAt: true,
        },
      })) as unknown as Array<{
        id: number;
        url: string;
        finalUrl?: string | null;
        title: string | null;
        status: string;
        linkCount: number;
        queuedAt: Date;
        startedAt: Date | null;
        finishedAt: Date | null;
        error: string | null;
        createdAt: Date;
      }>;

      const pagination: Pagination = {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      };

      return res.json({
        pages,
        pagination,
      });
    } catch (error) {
      console.error("Get pages error:", error);
      return res
        .status(500)
        .json({ message: "Server error while retrieving pages" });
    }
  }
);

/**
 * @route   GET /api/pages/:id
 * @desc    Get a specific page with its links (paginated)
 * @access  Private
 */
router.get(
  "/:id",
  authenticate,
  [
    param("id").isInt().withMessage("Page ID must be an integer").toInt(),

    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100")
      .toInt(),
  ],
  async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const pageData = (await prisma.page.findFirst({
        where: {
          id: Number(id),
          userId,
        },
        select: {
          id: true,
          url: true,
          title: true,
          status: true,
          linkCount: true,
          queuedAt: true,
          startedAt: true,
          finishedAt: true,
          error: true,
          createdAt: true,
        },
      })) as unknown as {
        id: number;
        url: string;
        finalUrl?: string | null;
        title: string | null;
        status: string;
        linkCount: number;
        queuedAt: Date;
        startedAt: Date | null;
        finishedAt: Date | null;
        error: string | null;
        createdAt: Date;
      } | null;

      if (!pageData) {
        return res.status(404).json({ message: "Page not found" });
      }

      const totalLinks = await prisma.link.count({
        where: { pageId: Number(id) },
      });

      const links = await prisma.link.findMany({
        where: { pageId: Number(id) },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          href: true,
          name: true,
          createdAt: true,
        },
      });

      const pagination: Pagination = {
        total: totalLinks,
        page,
        limit,
        pages: Math.ceil(totalLinks / limit),
      };

      return res.json({
        page: pageData,
        links,
        pagination,
      });
    } catch (error) {
      console.error("Get page details error:", error);
      return res
        .status(500)
        .json({ message: "Server error while retrieving page details" });
    }
  }
);

export default router;
