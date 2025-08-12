import { PrismaClient } from "@prisma/client";
import Queue, { Job } from "bull";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import type { ScrapeJob, ScrapeResult } from "@link-scraper/shared";
import { validateUrl, normalizeUrl } from "./utils/url-validator";

dotenv.config();

const prisma = new PrismaClient();

// Use environment variables for Redis connection
const scrapeQueue = new Queue<ScrapeJob>(
  "scrape-queue",
  process.env.REDIS_URL || "redis://localhost:6379"
);

// Get worker configuration from environment variables
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "5", 10);
const MAX_ATTEMPTS = parseInt(process.env.MAX_ATTEMPTS || "3", 10);
const BACKOFF_DELAY = parseInt(process.env.BACKOFF_DELAY || "5000", 10);
const MAX_CONTENT_SIZE = parseInt(process.env.MAX_CONTENT_SIZE || "5242880", 10); // 5MB default
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || "30000", 10); // 30 seconds default
const USER_AGENT = process.env.USER_AGENT || "Mozilla/5.0 (compatible; LinkScraper/1.0; +https://example.com/bot)";

type ScrapedLink = { href: string; name: string | null };

async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    // Validate URL to prevent SSRF attacks
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

    // Validate content type
    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("text/html")) {
      throw new Error(`Not an HTML page. Content-Type: ${contentType}`);
    }

    // Get final URL after redirects
    const finalUrl = response.request.res.responseUrl || url;

    const $ = cheerio.load(response.data);
    const title = $("title").text().trim() || finalUrl;

    const links: ScrapedLink[] = [];
    $("a").each((_i, el) => {
      const rawHref = $(el).attr("href");
      if (!rawHref) return;

      try {
        // Normalize URL using the final URL as base
        const href = new URL(rawHref, finalUrl).href;
        
        // Skip unsafe URLs
        if (!validateUrl(href)) {
          return;
        }

        let name = $(el).text().trim() || null;
        if (!name) name = `Link to ${href}`;
        if (name.length > 255) name = name.slice(0, 252) + "...";

        links.push({ href, name });
      } catch {
        // Skip invalid URLs
        return;
      }
    });

    return { title, links, finalUrl };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error scraping ${url}:`, msg);
    throw err;
  }
}

// Configure queue processing with concurrency from environment
scrapeQueue.process(CONCURRENCY, async (job: Job<ScrapeJob>): Promise<{ links: number }> => {
  const { pageId, url } = job.data;
  console.log(`Processing job ${job.id} for page ${pageId}: ${url}`);

  try {
    // Update page status to processing
    await prisma.page.update({
      where: { id: pageId },
      data: { status: "processing", startedAt: new Date() },
    });

    // Scrape the URL
    const { title, links, finalUrl } = await scrapeUrl(url);

    // Store normalized URLs and deduplicate
    const uniqueLinks = Array.from(
      new Map<string, ScrapedLink>(
        links.map((l) => {
          const normalizedHref = normalizeUrl(l.href);
          return [normalizedHref, { href: l.href, name: l.name ?? null }];
        })
      ).values()
    );

    // Store links in database
    if (uniqueLinks.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Delete existing links first
        await tx.link.deleteMany({ where: { pageId } });

        // Create new links
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

    // Update page with results and final URL
    await prisma.page.update({
      where: { id: pageId },
      data: {
        title,
        finalUrl: finalUrl !== url ? finalUrl : undefined, // Only store if different
        status: "done",
        linkCount: uniqueLinks.length,
        finishedAt: new Date(),
      },
    });

    console.log(
      `Job ${job.id} completed. Found ${uniqueLinks.length} unique links.`
    );
    return { links: uniqueLinks.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Job ${job.id} failed:`, msg);

    try {
      await prisma.page.update({
        where: { id: pageId },
        data: { status: "failed", error: msg, finishedAt: new Date() },
      });
    } catch (e) {
      console.error("Failed to update page as failed:", e);
    }

    throw err;
  }
});

// Configure job options with environment variables
scrapeQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed`, result);
});
scrapeQueue.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed`, error?.message);
});

console.log(`Worker started with concurrency ${CONCURRENCY}. Waiting for jobs...`);

process.on("SIGINT", async () => {
  await scrapeQueue.close();
  await prisma.$disconnect();
  console.log("Worker shut down gracefully");
  process.exit(0);
});