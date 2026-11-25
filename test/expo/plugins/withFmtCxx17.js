const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

// test/package-check/expo/plugins/withFmtCxx17.js is a copy of this plugin.
// Keep the two copies in step.
//
// React Native 0.76 pins fmt 11.0.2, which does not compile as C++20 under
// Xcode 26.4 and later. React Native sets C++20 on every pod target in
// `react_native_post_install`, so this plugin sets C++17 on the fmt target
// after that call.
const MARKER = '# withFmtCxx17: build fmt 11.0.2 as C++17 for Xcode 26.4+';

const RN_POST_INSTALL = /^( *)react_native_post_install\([\s\S]*?^\1\)\n/m;

function addFmtCxx17(podfile) {
  if (podfile.includes(MARKER)) {
    return podfile;
  }

  const match = podfile.match(RN_POST_INSTALL);
  if (!match) {
    throw new Error(
      'withFmtCxx17: the Podfile has no react_native_post_install call.'
    );
  }

  const indent = match[1];
  const block = [
    '',
    MARKER,
    'installer.pods_project.targets.each do |target|',
    "  next unless target.name == 'fmt'",
    '  target.build_configurations.each do |build_config|',
    "    build_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'",
    '  end',
    'end',
  ]
    .map((line) => (line ? indent + line : line))
    .join('\n');

  const end = match.index + match[0].length;
  return `${podfile.slice(0, end)}${block}\n${podfile.slice(end)}`;
}

const withFmtCxx17 = (config) =>
  withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const podfilePath = path.join(
        modConfig.modRequest.platformProjectRoot,
        'Podfile'
      );
      const podfile = await fs.promises.readFile(podfilePath, 'utf8');
      await fs.promises.writeFile(podfilePath, addFmtCxx17(podfile));
      return modConfig;
    },
  ]);

module.exports = withFmtCxx17;
module.exports.addFmtCxx17 = addFmtCxx17;
