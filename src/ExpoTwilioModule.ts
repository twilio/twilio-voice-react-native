import { NativeModule, requireNativeModule } from 'expo';

import { ExpoTwilioModuleEvents } from './ExpoTwilio.types';

declare class ExpoTwilioModule extends NativeModule<ExpoTwilioModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  voice_connect(accessToken: string, twimlParams: any, calleeName: string, displayName: string): string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoTwilioModule>('ExpoTwilio');
