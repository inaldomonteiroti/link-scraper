import { validateUrl, normalizeUrl } from "../../src/utils/url-validator";

describe("URL Validator", () => {
  describe("validateUrl", () => {
    it("should validate correct HTTP and HTTPS URLs", () => {
      expect(validateUrl("https://example.com")).toBe(true);
      expect(validateUrl("http://example.com/path?query=value")).toBe(true);
      expect(validateUrl("https://sub.domain.example.com/path")).toBe(true);
    });

    it("should reject invalid or unsafe URLs", () => {
      expect(validateUrl("ftp://example.com")).toBe(false);
      expect(validateUrl("not-a-url")).toBe(false);
      expect(validateUrl("file:///etc/passwd")).toBe(false);

      process.env.NODE_ENV = "production";
      expect(validateUrl("http://localhost")).toBe(false);
      expect(validateUrl("http://127.0.0.1")).toBe(false);
      expect(validateUrl("http://192.168.1.1")).toBe(false);
      process.env.NODE_ENV = "test";
    });
  });

  describe("normalizeUrl", () => {
    it("should normalize URLs by removing fragments and normalizing paths", () => {
      expect(normalizeUrl("https://example.com/#fragment")).toBe(
        "https://example.com/"
      );
      expect(normalizeUrl("https://example.com")).toBe("https://example.com/");
      expect(normalizeUrl("https://example.com/path/")).toBe(
        "https://example.com/path/"
      );
    });

    it("should return the original string if URL parsing fails", () => {
      const invalidUrl = "not-a-url";
      expect(normalizeUrl(invalidUrl)).toBe(invalidUrl);
    });
  });
});
