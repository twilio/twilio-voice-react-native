jest.mock('react-native', () => ({
  TurboModuleRegistry: { get: jest.fn(() => ({ mockModule: true })) },
}));

import { TurboModuleRegistry } from 'react-native';
import NativeTwilioVoiceReactNative from '../specs/NativeTwilioVoiceReactNative';

describe('NativeTwilioVoiceReactNative', () => {
  it('gets the module from the TurboModuleRegistry', () => {
    const get = TurboModuleRegistry.get as jest.Mock;
    expect(get).toHaveBeenCalledWith('TwilioVoiceReactNative');
    expect(NativeTwilioVoiceReactNative).toBe(get.mock.results[0]?.value);
  });
});
