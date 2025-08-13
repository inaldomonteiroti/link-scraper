import Queue, { Job } from "bull";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import type { ScrapeJob, ScrapeResult } from "./types";
import { validateUrl, normalizeUrl } from "./utils/url-validator";
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const prisma = new PrismaClient();

const scrapeQueue = new Queue<ScrapeJob>(
  "scrape-queue",
  process.env.REDIS_URL || "redis://localhost:6379"
);

const CONCURRENCY = parseInt(process.env.CONCURRENCY || "5", 10);
const MAX_ATTEMPTS = parseInt(process.env.MAX_ATTEMPTS || "3", 10);
const BACKOFF_DELAY = parseInt(process.env.BACKOFF_DELAY || "5000", 10);
const MAX_CONTENT_SIZE = parseInt(
  process.env.MAX_CONTENT_SIZE || "5242880",
  10
); // 5MB default
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || "30000", 10); // 30 seconds default
const USER_AGENT =
  process.env.USER_AGENT ||
  "Mozilla/5.0 (compatible; LinkScraper/1.0; +https://example.com/bot)";

type ScrapedLink = { href: string; name: string | null };

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    if (!validateUrl(url)) {
      throw new Error("Invalid or potentially unsafe URL");
    }

    const response: AxiosResponse<string> = await axios.get(url, {
      timeout: REQUEST_TIMEOUT,
      maxContentLength: MAX_CONTENT_SIZE,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.5",
      },
      validateStatus: (s) => s >= 200 && s < 400,
      maxRedirects: 10, // Allow reasonable redirects
    });

    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("text/html")) {
      throw new Error(`Not an HTML page. Content-Type: ${contentType}`);
    }

    const finalUrl = response.request.res.responseUrl || url;

    const $ = cheerio.load(response.data);
    const title = $("title").text().trim() || finalUrl;

    const links: ScrapedLink[] = [];
    $("a").each((_i, el) => {
      const rawHref = $(el).attr("href");
      if (!rawHref) return;

      try {
        const href = new URL(rawHref, finalUrl).href;

        if (!validateUrl(href)) {
          return;
        }

        let name = $(el).text().trim() || null;
        if (!name) name = `Link to ${href}`;
        if (name.length > 255) name = name.slice(0, 252) + "...";

        links.push({ href, name });
      } catch {
        return;
      }
    });

    return { title, links, finalUrl };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (process.env.NODE_ENV !== "test") {
      console.error(`Error scraping ${url}:`, msg);
    }
    throw err;
  }
}

scrapeQueue.process(
  CONCURRENCY,
  async (job: Job<ScrapeJob>): Promise<{ links: number }> => {
    const { pageId, url } = job.data;
    if (process.env.NODE_ENV !== "test") {
      console.log(`Processing job ${job.id} for page ${pageId}: ${url}`);
    }

    try {
      await prisma.page.update({
        where: { id: pageId },
        data: { status: "processing", startedAt: new Date() },
      });

      const { title, links, finalUrl } = await scrapeUrl(url);

      const uniqueLinks = Array.from(
        new Map<string, ScrapedLink>(
          links.map((l: { href: string; name: string | null }) => {
            const normalizedHref = normalizeUrl(l.href);
            return [normalizedHref, { href: l.href, name: l.name ?? null }];
          })
        ).values()
      );

      if (uniqueLinks.length > 0) {
        await prisma.$transaction(async (tx: any) => {
          await tx.link.deleteMany({ where: { pageId } });

          await tx.link.createMany({
            data: uniqueLinks.map((l) => ({
              pageId,
              href: l.href,
              name: l.name,
            })),
            skipDuplicates: true,
          });
        });
      }

      await prisma.page.update({
        where: { id: pageId },
        data: {
          title,
          finalUrl: finalUrl !== url ? finalUrl : undefined,
          status: "done",
          linkCount: uniqueLinks.length,
          finishedAt: new Date(),
        },
      });

      if (process.env.NODE_ENV !== "test") {
        console.log(
          `Job ${job.id} completed. Found ${uniqueLinks.length} unique links.`
        );
      }
      return { links: uniqueLinks.length };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (process.env.NODE_ENV !== "test") {
        console.error(`Job ${job.id} failed:`, msg);
      }

      try {
        await prisma.page.update({
          where: { id: pageId },
          data: { status: "failed", error: msg, finishedAt: new Date() },
        });
      } catch (e) {
        if (process.env.NODE_ENV !== "test") {
          console.error("Failed to update page as failed:", e);
        }
      }

      throw err;
    }
  }
);

scrapeQueue.on("completed", (job: any, result: any) => {
  if (process.env.NODE_ENV !== "test") {
    console.log(`Job ${job.id} completed`, result);
  }
});
scrapeQueue.on("failed", (job: any, error: any) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(`Job ${job?.id} failed`, error?.message);
  }
});

if (process.env.NODE_ENV !== "test") {
  console.log(
    `Worker started with concurrency ${CONCURRENCY}. Waiting for jobs...`
  );
}

process.on("SIGINT", async () => {
  await scrapeQueue.close();
  await prisma.$disconnect();
  console.log("Worker shut down gracefully");
  process.exit(0);
});
