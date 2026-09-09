const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
// Metro 0.83 restricts its exports map; the old `src/defaults` subpath is no
// longer reachable and `./private/*` maps to the same file.
const exclusionList = require('metro-config/private/defaults/exclusionList').default;
const escape = require('escape-string-regexp');
const pak = require('../../package.json');

const root = path.resolve(__dirname, '../..');

const modules = Object.keys({
  ...pak.peerDependencies,
});

/**
 * The Appium harness lives outside this project and is bundled here by
 * `index.harness.js`, so that the same twelve suites run under a bare React
 * Native runtime as well as an Expo one.
 *
 * Its own `node_modules` carries a newer React Native than this app does.
 * Metro resolves from the importing file outwards, so without the two rules
 * below it loads that copy and Babel fails parsing syntax this version does
 * not understand, for example VirtualView.js. Block that tree and pin the
 * shared packages to this app's copies.
 */
const harnessModules = path.resolve(__dirname, '../appium-harness/node_modules');

const sharedWithHarness = [
  'react',
  'react-native',
  'react-native-safe-area-context',
  '@twilio/voice-react-native-sdk',
];

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we exclude them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blockList: exclusionList([
      ...modules.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
      ),
      new RegExp(`^${escape(harnessModules)}\\/.*$`),
    ]),

    extraNodeModules: [...modules, ...sharedWithHarness].reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
