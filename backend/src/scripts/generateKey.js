import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
const secret = randomBytes(64).toString("hex");

let envFile = "";
if (fs.existsSync(envPath)) {
  envFile = fs.readFileSync(envPath, "utf8");

  if (/^JWT_SECRET=/m.test(envFile)) {
    // replace existing JWT_SECRET
    envFile = envFile.replace(/^JWT_SECRET=.*/m, `JWT_SECRET=${secret}`);
  } else {
    envFile += `\nJWT_SECRET=${secret}\n`;
  }
} else {
  envFile = `JWT_SECRET=${secret}\n`;
}

fs.writeFileSync(envPath, envFile, "utf8");
console.log("✅ JWT_SECRET generated and saved to .env");
