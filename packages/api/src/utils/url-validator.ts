/**
 * Validates a URL to prevent SSRF attacks and ensure it's a valid HTTP/HTTPS URL
 */
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    // Prevent localhost access in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsedUrl.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.endsWith('.local')
      ) {
        return false;
      }
    }
    
    // Prevent private IP ranges in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsedUrl.hostname;
      // Simple check for private IP ranges
      if (
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('192.168.')
      ) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Normalizes a URL by removing fragments and normalizing the path
 */
export function normalizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    
    // Remove fragments
    parsedUrl.hash = '';
    
    // Normalize path
    if (parsedUrl.pathname === '') {
      parsedUrl.pathname = '/';
    }
    
    return parsedUrl.toString();
  } catch (error) {
    return url;
  }
}