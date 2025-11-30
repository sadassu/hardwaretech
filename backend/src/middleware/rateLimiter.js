import { ratelimit } from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const { success } = await ratelimit.limit("my-limit-key");

    if (!success) {
      return res
        .status(429)
        .json({ message: "too many request, try again later" });
    }

    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;
