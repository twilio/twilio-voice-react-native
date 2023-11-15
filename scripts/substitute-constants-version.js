'use strict';

const { readFile, writeFile } = require('fs').promises;

async function substituteVersion(constantsPath, version) {
  const constantsInput = (await readFile(constantsPath)).toString('utf-8');

  /**
   * NOTE(afalls): revisit VBLOCKS-2285
   */
  const constantsOutput = constantsInput.replace(
    /(ReactNativeVoiceSDKVer\s*=\s*)(.*)/g,
    '$1' + version
  );

  await writeFile(constantsPath, constantsOutput);
}

function parseCommandLineArgs() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    throw 'No version argument.';
  }

  const version = args[0];

  if (!(version.length > 0)) {
    throw 'Version argument invalid.';
  }

  return { version };
}

async function main() {
  const args = parseCommandLineArgs();

  const constantsPath = './constants/constants.src';

  // Substitute version
  await substituteVersion(constantsPath, args.version);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
