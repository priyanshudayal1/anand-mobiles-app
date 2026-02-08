#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Check if GOOGLE_SERVICES_JSON environment variable exists
const googleServicesJson = process.env.GOOGLE_SERVICES_JSON;

if (!googleServicesJson) {
  console.error("❌ GOOGLE_SERVICES_JSON environment variable is not set");
  process.exit(1);
}

try {
  // Decode base64 and write to file
  const decoded = Buffer.from(googleServicesJson, "base64").toString("utf-8");
  const targetPath = path.join(__dirname, "..", "google-services.json");

  fs.writeFileSync(targetPath, decoded);
  console.log("✅ google-services.json restored successfully");
} catch (error) {
  console.error("❌ Failed to restore google-services.json:", error.message);
  process.exit(1);
}
