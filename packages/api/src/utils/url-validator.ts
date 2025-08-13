/**
 * Validates a URL to prevent SSRF attacks
 * In development mode, localhost is allowed
 */
export const validateUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    if (process.env.NODE_ENV === "production") {
      const hostname = parsedUrl.hostname;
      if (
        hostname === "localhost" ||
        hostname.match(/^127\.\d+\.\d+\.\d+$/) ||
        hostname.match(/^10\.\d+\.\d+\.\d+$/) ||
        hostname.match(/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/) ||
        hostname.match(/^192\.168\.\d+\.\d+$/)
      ) {
        return false;
      }
    }

    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

export const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);

    let normalized =
      parsed.protocol.toLowerCase() + "//" + parsed.host.toLowerCase();

    if (parsed.pathname === "/") {
      normalized += "/";
    } else {
      normalized += parsed.pathname.endsWith("/")
        ? parsed.pathname
        : parsed.pathname.replace(/\/+$/, "");
    }

    if (parsed.search) {
      const params = new URLSearchParams(parsed.search);
      const paramPairs: [string, string][] = [];
      params.forEach((value, key) => {
        paramPairs.push([key, value]);
      });
      paramPairs.sort((a, b) => a[0].localeCompare(b[0]));

      const sortedParams = new URLSearchParams();
      paramPairs.forEach(([key, value]) => {
        sortedParams.append(key, value);
      });

      normalized += "?" + sortedParams.toString();
    }

    return normalized;
  } catch {
    return url;
  }
};
