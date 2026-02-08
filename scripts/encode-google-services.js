#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "google-services.json");

if (!fs.existsSync(filePath)) {
  console.error("❌ google-services.json not found");
  process.exit(1);
}

try {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const base64Content = Buffer.from(fileContent).toString("base64");

  console.log("\n✅ Base64 encoded google-services.json:\n");
  console.log(base64Content);
  console.log("\n📋 Copy the above value and run:\n");
  console.log(
    'eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "<paste-base64-here>" --type string\n',
  );
} catch (error) {
  console.error("❌ Failed to encode file:", error.message);
  process.exit(1);
}
