const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const escape = require('escape-string-regexp');
const pak = require('../../package.json');

const config = getDefaultConfig(__dirname);

const root = path.resolve(__dirname, '../..');
config.watchFolders = [root];

const modules = Object.keys({ ...pak.peerDependencies });

const blockList = modules.map(
  (m) => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
).concat(config?.resolver?.blockList || []);

const extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name);
  return acc;
}, {});

config.resolver = {
  ...config.resolver,
  blockList,
  extraNodeModules,
};

module.exports = config;
