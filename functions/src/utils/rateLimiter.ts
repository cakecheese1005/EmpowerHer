import {RateLimiterMemory} from "rate-limiter-flexible";
import * as admin from "firebase-admin";

// Per-user rate limiter: 10 requests per hour
export const userRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 3600, // 1 hour
});

// Per-IP rate limiter: 20 requests per hour
export const ipRateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 3600, // 1 hour
});

export async function checkRateLimit(
  userId: string | null,
  ip: string
): Promise<void> {
  if (userId) {
    try {
      await userRateLimiter.consume(userId);
    } catch (rejRes) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
  }

  try {
    await ipRateLimiter.consume(ip);
  } catch (rejRes) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
}

