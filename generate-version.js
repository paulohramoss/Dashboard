import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let versionString = "v1.0.0";
try {
  const commitCount = execSync("git rev-list --count HEAD").toString().trim();
  versionString = `v1.0.${commitCount}`;
} catch (e) {
  console.warn("Failed to get commit count:", e.message);
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

console.log("Version file generated:", version);
