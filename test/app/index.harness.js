/**
 * Bare React Native entry point for the Appium harness.
 *
 * The harness screen and its twelve suites live in `test/appium-harness/src`
 * and import nothing from Expo, so the same source drives both app types. Only
 * the entry point and the host app differ. Metro already watches the repo
 * root, so the import below resolves without further configuration.
 *
 * Selected at bundling time: pass `-PentryFile=index.harness.js` to Gradle or
 * `ENTRY_FILE=index.harness.js` to xcodebuild. The default entry stays
 * `index.js`, so the example app is unaffected.
 *
 * This only affects builds that embed a bundle, which means release builds. A
 * debug build has no embedded bundle and asks Metro for the module named by
 * `MainApplication.getJSMainModuleName()`, which is hardcoded to `index`, so a
 * debug build always loads the example app regardless of `entryFile`. Build
 * release to run the harness.
 *
 * @format
 */

import {AppRegistry} from 'react-native';
import Application from '../appium-harness/src/app/index';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Application);
