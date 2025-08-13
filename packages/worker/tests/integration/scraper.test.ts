import { scrapeUrl } from "../../src/worker";

const axios = require("axios");
const cheerio = require("cheerio");

jest.mock("axios", () => ({
  get: jest.fn(),
}));

jest.mock("cheerio", () => ({
  load: jest.fn(),
}));

beforeAll(() => {
  if (typeof global.ReadableStream === "undefined") {
    require("../setup");
  }

  process.env.NODE_ENV = "test";
});

describe("Worker Scraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully scrape a valid HTML page", async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <a href="https://example.com/link1">Link 1</a>
          <a href="https://example.com/link2">Link 2</a>
          <a href="/relative-link">Relative Link</a>
        </body>
      </html>
    `;

    axios.get.mockResolvedValue({
      data: mockHtml,
      headers: { "content-type": "text/html" },
      request: {
        res: {
          responseUrl: "https://example.com/test",
        },
      },
    });

    const mockCheerioInstance = {
      title: jest.fn().mockReturnValue({
        text: jest.fn().mockReturnValue("Test Page"),
      }),
    };

    const mockCheerioFunction = function (selector: any) {
      if (selector === "title") {
        return {
          text: () => "Test Page",
        };
      }

      if (selector === "a") {
        return {
          each: function (callback: (index: number, element: any) => void) {
            callback(0, { id: "link1" });
            callback(1, { id: "link2" });
            callback(2, { id: "link3" });
          },
        };
      }

      if (selector.id === "link1") {
        return {
          attr: function (name: string) {
            return name === "href" ? "https://example.com/link1" : null;
          },
          text: function () {
            return "Link 1";
          },
        };
      }

      if (selector.id === "link2") {
        return {
          attr: function (name: string) {
            return name === "href" ? "https://example.com/link2" : null;
          },
          text: function () {
            return "Link 2";
          },
        };
      }

      if (selector.id === "link3") {
        return {
          attr: function (name: string) {
            return name === "href" ? "/relative-link" : null;
          },
          text: function () {
            return "Relative Link";
          },
        };
      }

      return {
        attr: () => null,
        text: () => "",
      };
    };

    mockCheerioFunction.text = () => "Test Page";

    cheerio.load.mockReturnValue(mockCheerioFunction);

    const result = await scrapeUrl("https://example.com/test");

    expect(axios.get).toHaveBeenCalledWith(
      "https://example.com/test",
      expect.any(Object)
    );
    expect(result).toEqual({
      title: "Test Page",
      finalUrl: "https://example.com/test",
      links: expect.arrayContaining([
        expect.objectContaining({
          href: "https://example.com/link1",
          name: "Link 1",
        }),
        expect.objectContaining({
          href: "https://example.com/link2",
          name: "Link 2",
        }),
        expect.objectContaining({
          href: "https://example.com/relative-link",
          name: "Relative Link",
        }),
      ]),
    });
    expect(result.links).toHaveLength(3);
  });

  it("should throw an error for non-HTML content", async () => {
    axios.get.mockResolvedValue({
      data: "PDF content",
      headers: { "content-type": "application/pdf" },
    });

    await expect(scrapeUrl("https://example.com/document.pdf")).rejects.toThrow(
      "Not an HTML page"
    );
  });
});
