/**
 * @format
 */

import { AppRegistry } from 'react-native';
import OutgoingCallTest from './src/e2e/OutgoingCall';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => OutgoingCallTest);
