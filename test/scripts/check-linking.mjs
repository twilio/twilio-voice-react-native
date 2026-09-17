#!/usr/bin/env node
/**
 * Guard the property this release exists to restore: the package autolinks in a
 * framework-less React Native app.
 *
 * 2.x broke bare support by shipping a `react-native.config.js` that set
 * `dependency.platforms.android = null`, which switched off React Native CLI
 * autolinking. Nothing failed loudly: the package still installed, and the
 * breakage only appeared when a bare app tried to build. This check makes that
 * regression a failing CI step instead.
 *
 * Deliberately needs no Android SDK, emulator or Gradle, so it can run in any
 * CI job.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PACKAGE_NAME = '@twilio/voice-react-native-sdk';

const failures = [];
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok    ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.log(`  FAIL  ${name}`);
    console.log(`        ${error.message}`);
  }
};

/**
 * Files whose presence disables React Native CLI autolinking, or re-registers
 * the package as an Expo module. Either reintroduces the 2.x breakage.
 */
const FORBIDDEN = ['react-native.config.js', 'expo-module.config.json'];

check('the package ships no autolinking overrides', () => {
  const present = FORBIDDEN.filter((f) => existsSync(join(REPO, f)));
  if (present.length) {
    throw new Error(
      `${present.join(', ')} present at the package root. These disable ` +
        'React Native CLI autolinking on Android, which is what removed bare ' +
        'React Native support in 2.x.'
    );
  }
});

check('the files array does not publish autolinking overrides', () => {
  const { files = [] } = JSON.parse(
    readFileSync(join(REPO, 'package.json'), 'utf8')
  );
  const listed = FORBIDDEN.filter((f) => files.includes(f));
  if (listed.length) {
    throw new Error(`package.json "files" lists ${listed.join(', ')}`);
  }
});

check('the package declares no runtime dependency on expo', () => {
  const pkg = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'));
  const runtime = { ...(pkg.dependencies || {}) };
  const offenders = Object.keys(runtime).filter((d) => /^expo(-|$)/.test(d));
  if (offenders.length) {
    throw new Error(
      `${offenders.join(', ')} in "dependencies". Expo must stay an optional ` +
        'peer dependency, or a bare app pays for it.'
    );
  }
});

check('src imports nothing from expo-modules-core', () => {
  // Match import and require statements only. A bare mention in a comment is
  // harmless, and one of the unit tests asserts the absence of this very
  // string, so a plain substring search reports itself.
  let out = '';
  try {
    out = execFileSync(
      'grep',
      [
        '-rlE',
        String.raw`(from\s+['"]expo-modules-core|require\(\s*['"]expo-modules-core)`,
        join(REPO, 'src'),
      ],
      { encoding: 'utf8' }
    ).trim();
  } catch (error) {
    // grep exits 1 when nothing matches, which is the passing case.
    if (error.status !== 1) {
      throw error;
    }
  }

  if (out) {
    throw new Error(
      `${out.split('\n').join(', ')} imports expo-modules-core. Metro resolves ` +
        'statically, so any such import anywhere reachable makes the package ' +
        'unbundleable in a bare app.'
    );
  }
});

check('React Native CLI autolinks the package in the bare test app', () => {
  const appDir = join(REPO, 'test/app');
  if (!existsSync(join(appDir, 'node_modules'))) {
    throw new Error('test/app dependencies are not installed');
  }

  const raw = execFileSync('npx', ['react-native', 'config'], {
    cwd: appDir,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  const config = JSON.parse(raw);
  const dep = config.dependencies?.[PACKAGE_NAME];
  if (!dep) {
    throw new Error(`${PACKAGE_NAME} is absent from react-native config`);
  }

  const android = dep.platforms?.android;
  if (!android) {
    throw new Error(
      'platforms.android is null, so the package is not autolinked. This is ' +
        'exactly the 2.x breakage.'
    );
  }

  if (!/TwilioVoiceReactNativePackage/.test(android.packageInstance || '')) {
    throw new Error(
      `unexpected packageInstance: ${android.packageInstance}`
    );
  }
});

console.log('');
if (failures.length) {
  console.log(`${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('all linking checks passed');
