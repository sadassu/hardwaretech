// utils/tokens.js
import crypto from "crypto";

export function createVerificationToken() {
  // token sent to user (plain) and hashed stored in DB
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}
