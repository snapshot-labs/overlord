// Rate limiting configuration
const MAX_REQUESTS_PER_MINUTE = 500;
const MINUTE_IN_MS = 60 * 1000;
const requestTimestamps: number[] = [];

/**
 * Rate-limited fetch to ensure max 500 requests per minute using sliding window
 */
export async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const oneMinuteAgo = now - MINUTE_IN_MS;

  // Remove timestamps older than 1 minute
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  // Check if we've exceeded the rate limit
  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const error = new Error(
      'Rate limit exceeded: 500 requests per minute'
    ) as any;
    error.status = 429;
    throw error;
  }

  // Record this request timestamp
  requestTimestamps.push(now);

  return fetch(url);
}
