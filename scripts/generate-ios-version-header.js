'use strict';

const { readFile, writeFile } = require('fs').promises;

async function main() {
  const packageJsonPath = './package.json';
  const versionTemplatePath = './scripts/version.ios.template';
  const headerOutputPath = './ios/TwilioVoiceReactNativeVersion.h';

  const packageJsonSource = (await readFile(packageJsonPath)).toString('utf-8');

  const json = JSON.parse(packageJsonSource);
  const version = json['version'];

  let templateSource = (await readFile(versionTemplatePath)).toString('utf-8');
  const verionHeaderSource = String(templateSource).replace(
    /{{PACKAGE_VERSION}}/g,
    version
  );

  await writeFile(headerOutputPath, verionHeaderSource);
}

main();
