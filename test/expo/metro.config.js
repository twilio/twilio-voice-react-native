const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');
const pak = require('../../package.json');

const config = getDefaultConfig(__dirname);

const root = path.resolve(__dirname, '../..');
config.watchFolders = [root];

const modules = Object.keys({ ...pak.peerDependencies });

/**
 * `TEST_EXPO_ENTRY=harness` bundles the Appium harness source, which lives
 * outside this project. The harness `node_modules` carries a newer React
 * Native than this app does. Block that tree and pin the shared packages to
 * this app's copies, the same as `test/app/metro.config.js`.
 */
const harnessModules = path.resolve(__dirname, '../appium-harness/node_modules');

const sharedWithHarness = [
  'react',
  'react-native',
  'react-native-safe-area-context',
  '@twilio/voice-react-native-sdk',
];

const blockList = exclusionList([
  ...modules.map(
    (m) => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
  ),
  new RegExp(`^${escape(harnessModules)}\\/.*$`),
]);

const extraNodeModules = [...modules, ...sharedWithHarness].reduce(
  (acc, name) => {
    acc[name] = path.join(__dirname, 'node_modules', name);
    return acc;
  },
  {}
);

config.resolver = {
  ...config.resolver,
  blockList,
  extraNodeModules,
};

module.exports = config;
