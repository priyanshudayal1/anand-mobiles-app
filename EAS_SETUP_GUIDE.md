# EAS Build Setup for google-services.json

This guide explains how to configure EAS Build to use your `google-services.json` file securely.

## Why is this needed?

`google-services.json` contains sensitive Firebase credentials and should **never** be committed to git. However, EAS Build needs this file to build your Android app. We solve this by:

1. Storing the file content as a base64-encoded EAS secret
2. Restoring it during the build process using a prebuild script

## Setup Steps

### Step 1: Encode your google-services.json file

Run the encoding script to get the base64-encoded value:

```bash
npm run encode:google-services
```

Or directly:

```bash
node scripts/encode-google-services.js
```

This will output a long base64 string. **Copy this entire string.**

### Step 2: Create an EAS Secret

Run the following command and paste the base64 string when prompted:

```bash
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "<paste-base64-here>" --type string
```

**Important:** Make sure to:
- Use `GOOGLE_SERVICES_JSON` as the exact name (it matches what's in eas.json)
- Use `--scope project` to make it available to all builds
- Use `--type string` to store it as a string value

Alternatively, you can create the secret interactively:

```bash
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type string
```

Then paste the base64 value when prompted.

### Step 3: Verify the secret was created

List your EAS secrets to confirm:

```bash
eas secret:list
```

You should see `GOOGLE_SERVICES_JSON` in the list.

### Step 4: Build your app

Now you can run your EAS build as usual:

```bash
# Development build
eas build --platform android --profile development

# Preview build
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

## How it works

1. **eas.json** is configured to:
   - Reference the `@google-services-json` secret via environment variables
   - Run `scripts/restore-google-services.js` as a prebuild command

2. **restore-google-services.js** script:
   - Reads the `GOOGLE_SERVICES_JSON` environment variable
   - Decodes the base64 content
   - Writes it to `google-services.json` in the project root

3. The build process then uses the restored `google-services.json` file

## Updating the secret

If you need to update your Firebase configuration:

1. Update your local `google-services.json` file
2. Re-encode it: `npm run encode:google-services`
3. Delete the old secret: `eas secret:delete --name GOOGLE_SERVICES_JSON`
4. Create a new secret with the updated value (follow Step 2 again)

## Troubleshooting

### "GOOGLE_SERVICES_JSON environment variable is not set"

- Make sure you created the EAS secret with the exact name `GOOGLE_SERVICES_JSON`
- Verify with `eas secret:list`

### "Failed to restore google-services.json"

- The base64 encoding might be corrupted
- Try re-encoding the file and updating the secret

### Build still fails with "google-services.json is missing"

- Check that the `prebuildCommand` is set in your eas.json build profile
- Ensure the scripts directory exists and contains restore-google-services.js

## Files Created

- `scripts/encode-google-services.js` - Encodes your google-services.json to base64
- `scripts/restore-google-services.js` - Restores google-services.json during EAS Build
- Updated `eas.json` with environment variables and prebuild commands
- Updated `package.json` with `encode:google-services` script

## Security Notes

✅ **Good practices:**
- `google-services.json` is in `.gitignore`
- File content is stored securely in EAS secrets
- Only accessible during builds

❌ **Never:**
- Commit `google-services.json` to git
- Share the base64-encoded value publicly
- Use the same file for development and production (use different Firebase projects)
