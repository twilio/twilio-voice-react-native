#!/usr/bin/env node
/**
 * Check that the podspec `s.source` matches the `package.json` `repository` and
 * `version`. CocoaPods resolves the pod from `s.source` for a consumer that
 * does not use a `:path` entry, so a wrong URL or tag breaks that install.
 *
 * The podspec is read as text so the check needs no Ruby or CocoaPods. A
 * podspec line in a shape this script does not recognize fails the check
 * rather than passing silently.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PODSPEC = 'twilio-voice-react-native.podspec';
const PACKAGE_JSON = 'package.json';

const { repository } = JSON.parse(
  readFileSync(join(REPO, PACKAGE_JSON), 'utf8')
);
const podspec = readFileSync(join(REPO, PODSPEC), 'utf8');

const failures = [];

const expectedGit = `${repository}.git`;
const sources = podspec.match(/^\s*s\.source\s*=.*$/gm) ?? [];
const source =
  sources.length === 1 &&
  sources[0].match(
    /^\s*s\.source\s*=\s*\{\s*:git\s*=>\s*"([^"]+)"\s*,\s*:tag\s*=>\s*"([^"]+)"\s*\}\s*$/
  );

if (!source) {
  failures.push(
    `expected one line of the form s.source = { :git => "...", :tag => "..." }, found:\n${
      sources.join('\n') || '(none)'
    }`
  );
} else {
  const [, git, tag] = source;
  if (git !== expectedGit) {
    failures.push(
      `s.source git is ${git}, not the package.json repository ${expectedGit}`
    );
  }
  if (tag !== '#{s.version}') {
    failures.push(`s.source tag is "${tag}", not "#{s.version}"`);
  }
}

if (!/^\s*s\.version\s*=\s*package\["version"\]\s*$/m.test(podspec)) {
  failures.push('s.version is not package["version"]');
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`FAIL  ${PODSPEC}: ${failure}`);
  }
  process.exitCode = 1;
}

console.log(`ok    ${PODSPEC} s.source is ${expectedGit} at the package version`);
