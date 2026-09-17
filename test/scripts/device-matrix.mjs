#!/usr/bin/env node
/**
 * Install one APK onto several emulators at once and run the launch smoke on
 * each.
 *
 * An APK is not API-level specific: `minSdkVersion` is 24, so the same artifact
 * installs on every level in the matrix. Build once, run everywhere. The runs
 * are independent, so they fan out across devices; the builds do not, and stay
 * elsewhere.
 *
 * Usage:
 *   node test/scripts/device-matrix.mjs <apk> <appPackage> <avd>[,<avd>...]
 */

import { execFile, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const [apk, appPackage, avdList] = process.argv.slice(2);
if (!apk || !appPackage || !avdList) {
  console.error('usage: device-matrix.mjs <apk> <appPackage> <avd>[,<avd>...]');
  process.exit(2);
}
if (!existsSync(apk)) {
  console.error(`apk not found: ${apk}`);
  process.exit(2);
}

const SDK = `${process.env.HOME}/Library/Android/sdk`;
const ADB = `${SDK}/platform-tools/adb`;
const EMULATOR = `${SDK}/emulator/emulator`;
const BOOT_TIMEOUT_MS = 300000;

const avds = avdList.split(',').map((a) => a.trim()).filter(Boolean);

/** Each emulator needs its own even console port. */
const portFor = (index) => 5554 + index * 2;

const adb = (serial, args, opts = {}) =>
  execFileAsync(ADB, ['-s', serial, ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, ...opts });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function bootEmulator(avd, port) {
  const serial = `emulator-${port}`;

  const running = execFileSync(ADB, ['devices'], { encoding: 'utf8' });
  if (!running.includes(serial)) {
    // Detached: the emulator outlives this process so several can run at once.
    const child = execFile(EMULATOR, [
      '-avd', avd,
      '-port', String(port),
      '-no-window',
      '-no-audio',
      '-no-snapshot',
      '-no-boot-anim',
      '-gpu', 'swiftshader_indirect',
    ]);
    child.unref();
  }

  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const { stdout } = await adb(serial, ['shell', 'getprop', 'sys.boot_completed']);
      if (stdout.trim() === '1') return serial;
    } catch {
      // not up yet
    }
    await sleep(3000);
  }
  throw new Error(`${avd} did not boot within ${BOOT_TIMEOUT_MS / 1000}s`);
}

/**
 * Markers proving the SDK reached native and initialised, not merely that the
 * process started.
 */
const MARKERS = [
  'VoiceApplicationProxy: onCreate',
  'VoiceActivityProxy: onCreate',
  'instantiation of TwilioVoiceReactNativeModule',
];

async function smoke(serial, avd) {
  const started = Date.now();
  const { stdout: apiLevel } = await adb(serial, ['shell', 'getprop', 'ro.build.version.sdk']);

  await adb(serial, ['install', '-r', '-g', apk]);
  await adb(serial, ['logcat', '-c']);
  await adb(serial, ['shell', 'am', 'force-stop', appPackage]);

  /**
   * Resolve the launcher activity and start it explicitly.
   *
   * `monkey -c android.intent.category.LAUNCHER` looked like the portable
   * choice and is not: it silently failed to launch on four of five API levels
   * while reporting success, so the smoke recorded a false failure. `am start`
   * against a resolved component is deterministic.
   */
  const { stdout: resolved } = await adb(serial, [
    'shell', 'cmd', 'package', 'resolve-activity', '--brief',
    '-c', 'android.intent.category.LAUNCHER', appPackage,
  ]);
  const component = resolved
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith(`${appPackage}/`))
    .pop();
  if (!component) {
    throw new Error(`no launcher activity resolved for ${appPackage}`);
  }
  await adb(serial, ['shell', 'am', 'start', '-n', component]);

  let found = [];
  const deadline = Date.now() + 120000;
  let log = '';
  while (Date.now() < deadline) {
    ({ stdout: log } = await adb(serial, ['logcat', '-d']));
    found = MARKERS.filter((m) => log.includes(m));
    if (found.length === MARKERS.length) break;
    await sleep(3000);
  }

  const fatal = /FATAL EXCEPTION/.test(log);
  const seconds = Math.round((Date.now() - started) / 1000);

  return {
    avd,
    serial,
    api: apiLevel.trim(),
    status: found.length === MARKERS.length && !fatal ? 'Pass' : 'Fail',
    markers: `${found.length}/${MARKERS.length}`,
    fatal,
    seconds,
    missing: MARKERS.filter((m) => !found.includes(m)),
  };
}

async function main() {
  process.stderr.write(`booting ${avds.length} emulators in parallel\n`);
  const serials = await Promise.all(
    avds.map(async (avd, i) => {
      const serial = await bootEmulator(avd, portFor(i));
      process.stderr.write(`  ${avd} up on ${serial}\n`);
      return { avd, serial };
    })
  );

  process.stderr.write(`installing and smoking ${appPackage} on ${serials.length} devices\n`);
  const results = await Promise.all(
    serials.map(({ avd, serial }) =>
      smoke(serial, avd).catch((e) => ({
        avd,
        serial,
        api: '?',
        status: 'Fail',
        markers: '0/3',
        fatal: false,
        seconds: 0,
        missing: [String(e.message || e)],
      }))
    )
  );

  console.log(JSON.stringify({ apk, appPackage, results }, null, 2));
  process.exitCode = results.some((r) => r.status === 'Fail') ? 1 : 0;
}

main();
