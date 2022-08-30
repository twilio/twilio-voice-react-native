const fs = require('fs/promises');
const path = require('path');

require('dotenv').config();

const { GOOGLE_SERVICES_JSON } = process.env;

/**
 * Generate a "google-services.json" file for the Android application.
 * @returns - a string representing the "google-services.json".
 */
function generateGoogleServices() {
  const missingEnvVars = Object.entries({
    GOOGLE_SERVICES_JSON,
  })
    .filter(([_, v]) => typeof v !== 'string')
    .map(([k]) => k);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing environment variables "${missingEnvVars.join(', ')}".`
    );
  }

  const googleServicesJsonString =
    Buffer.from(GOOGLE_SERVICES_JSON, 'base64').toString();

  return googleServicesJsonString;
}

/**
 * Check if a file exists, and if not, save the "google-services.json" as a JSON
 * file.
 * @returns
 *  A `Promise` that
 *    - Resolves if successful.
 *    - Rejects if the file already exists, or if unable to write the file.
 */
async function saveFile(filePath, fileContents) {
  const accessTokenFileHandle = await fs.open(filePath, 'wx');
  await accessTokenFileHandle.write(fileContents);
  await accessTokenFileHandle.close();
}

/**
 * Main function. Generates and saves the "google-services.json".
 */
async function main() {
  const filePath = path.join(
    '.',
    'example',
    'android',
    'app',
    'google-services.json',
  );
  const fileContents = generateGoogleServices();
  await saveFile(filePath, fileContents);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
