'use strict';

const { readFile, writeFile } = require('fs').promises;

async function main() {
  const packageJsonPath = './package.json';
  const templatePath = './scripts/version.ios.template';
  const headerOutputPath = './ios/TwilioVoiceReactNativeVersion.h';

  const packageJsonSource = (await readFile(packageJsonPath)).toString('utf-8');

  const json = JSON.parse(packageJsonSource);
  const version = json['version'];

  const templateSource = (await readFile(templatePath)).toString('utf-8');
  const versionHeaderSource = templateSource.replace(
    /{{PACKAGE_VERSION}}/g,
    version
  );

  await writeFile(headerOutputPath, versionHeaderSource);
}

main();
