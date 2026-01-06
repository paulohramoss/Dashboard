/* eslint-env node */
/* global process */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let versionString = "v1.0.0";

try {
  // Try getting commit count
  const commitCount = execSync("git rev-list --count HEAD").toString().trim();
  versionString = `v1.0.${commitCount}`;

  // If on Vercel (shallow clone often results in low count), append hash or use hash to ensure uniqueness
  if (process.env.VERCEL) {
    const sha = process.env.VERCEL_GIT_COMMIT_SHA
      ? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)
      : "";
    // If shallow clone (count usually 1 or small), use SHA to ensure it updates
    if (parseInt(commitCount) < 20 || sha) {
      versionString = `v1.0.${commitCount}-${sha}`;
    }
  }
} catch (e) {
  console.warn("Failed to get commit count:", e.message);
  // Fallback for Vercel if git command completely fails
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    versionString = `v1.0.${process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)}`;
  }
}

const version = {
  version: versionString,
  date: new Date().toISOString(),
};

const publicDir = path.join(__dirname, "public");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

fs.writeFileSync(
  path.join(publicDir, "version.json"),
  JSON.stringify(version, null, 2)
);

const srcDir = path.join(__dirname, "src");
if (fs.existsSync(srcDir)) {
  fs.writeFileSync(
    path.join(srcDir, "version.json"),
    JSON.stringify(version, null, 2)
  );
}

console.log("Version file generated:", version);
