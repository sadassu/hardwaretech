import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import dotenv from "dotenv";

dotenv.config();

const redis = Redis.fromEnv();

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1500, "60 s"),
});

export const verificationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "2 m"),
});
