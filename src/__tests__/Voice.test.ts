import { createNativeAudioDevicesInfo } from '../__mocks__/AudioDevice';
import { createNativeCallInviteInfo } from '../__mocks__/CallInvite';
import { createNativeCancelledCallInviteInfo } from '../__mocks__/CancelledCallInvite';
import type { NativeEventEmitter as MockNativeEventEmitterType } from '../__mocks__/common';
import { createNativeErrorInfo } from '../__mocks__/Error';
import { mockVoiceNativeEvents } from '../__mocks__/Voice';
import type { AudioDevice } from '../AudioDevice';
import type { CallInvite } from '../CallInvite';
import { NativeEventEmitter, NativeModule } from '../common';
import { Constants } from '../constants';
import type { NativeVoiceEventType } from '../type/Voice';
import { Voice } from '../Voice';

const MockNativeEventEmitter =
  NativeEventEmitter as unknown as typeof MockNativeEventEmitterType;
const MockNativeModule = jest.mocked(NativeModule);
let MockAudioDevice: jest.Mock;
let MockCall: jest.Mock;
let MockCallInvite: jest.Mock & { State: typeof CallInvite.State };
let MockCancelledCallInvite: jest.Mock;
let MockTwilioError: jest.Mock;
let mockErrorsByCode: { get: jest.Mock };

jest.mock('../common');
jest.mock('../AudioDevice', () => ({
  AudioDevice: (MockAudioDevice = jest.fn()),
}));
jest.mock('../Call', () => ({
  Call: (MockCall = jest.fn()),
}));
jest.mock('../CallInvite', () => ({
  CallInvite: (MockCallInvite = Object.assign(jest.fn(), {
    State: {
      Pending: 'pending' as CallInvite.State.Pending,
      Accepted: 'accepted' as CallInvite.State.Accepted,
      Rejected: 'rejected' as CallInvite.State.Rejected,
    },
  })),
}));
jest.mock('../CancelledCallInvite', () => ({
  CancelledCallInvite: (MockCancelledCallInvite = jest.fn()),
}));
jest.mock('../error/TwilioError', () => ({
  TwilioError: (MockTwilioError = jest.fn()),
}));
jest.mock('../error/generated', () => ({
  errorsByCode: (mockErrorsByCode = { get: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockErrorsByCode.get.mockReset();
  MockNativeEventEmitter.reset();
});

describe('Voice class', () => {
  describe('constructor', () => {
    describe('event handler mapping', () => {
      it('creates an event handler mapping', () => {
        const voice = new Voice();
        // eslint-disable-next-line dot-notation
        expect(typeof voice['_nativeEventHandler']).toBeDefined();
      });

      it('contains an entry for every Voice event', () => {
        const voice = new Voice();
        // eslint-disable-next-line dot-notation
        const nativeEventHandler = voice['_nativeEventHandler'];
        [
          Constants.VoiceEventAudioDevicesUpdated,
          Constants.VoiceEventCallInvite,
          Constants.VoiceEventCallInviteAccepted,
          Constants.VoiceEventCallInviteCancelled,
          Constants.VoiceEventCallInviteRejected,
          Constants.VoiceEventError,
          Constants.VoiceEventRegistered,
          Constants.VoiceEventUnregistered,
        ].forEach((event: string) => {
          expect(event in nativeEventHandler).toBe(true);
        });
      });

      it('binds to the NativeEventEmitter', () => {
        const voice = new Voice();
        expect(MockNativeEventEmitter.addListener.mock.calls).toEqual([
          // eslint-disable-next-line dot-notation
          [Constants.ScopeVoice, voice['_handleNativeEvent']],
        ]);
      });
    });
  });

  describe('on receiving a valid native event', () => {
    Object.values(mockVoiceNativeEvents).forEach(({ name, nativeEvent }) => {
      describe(name, () => {
        it('handles valid events', () => {
          const voice = new Voice();
          expect(MockNativeEventEmitter.addListener).toHaveBeenCalledTimes(1);
          expect(MockNativeEventEmitter.addListenerSpies).toHaveLength(1);

          const intermediateHandlerSpy =
            MockNativeEventEmitter.expectListenerAndReturnSpy(
              0,
              Constants.ScopeVoice,
              voice['_handleNativeEvent'] // eslint-disable-line dot-notation
            );
          const handlerSpy = jest.spyOn(
            voice['_nativeEventHandler'] /* eslint-disable-line dot-notation */,
            nativeEvent.type as NativeVoiceEventType
          );

          MockNativeEventEmitter.emit(Constants.ScopeVoice, nativeEvent);

          expect(intermediateHandlerSpy.mock.calls).toEqual([[nativeEvent]]);
          expect(handlerSpy.mock.calls).toEqual([[nativeEvent]]);
        });
      });
    });

    describe(Constants.VoiceEventAudioDevicesUpdated, () => {
      it('constructs AudioDevice objects', () => {
        new Voice(); // eslint-disable-line no-new

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.audioDevicesUpdated.nativeEvent
        );

        expect(MockAudioDevice.mock.instances).toHaveLength(4);
        expect(MockAudioDevice.mock.calls).toEqual([
          ...createNativeAudioDevicesInfo().audioDevices.map((d) => [d]),
          [createNativeAudioDevicesInfo().selectedDevice],
        ]);
      });

      it('emits AudioDevice objects', () => {
        const voice = new Voice();
        const listenerMock = jest.fn();
        voice.on(Voice.Event.AudioDevicesUpdated, listenerMock);

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.audioDevicesUpdated.nativeEvent
        );

        expect(listenerMock).toHaveBeenCalledTimes(1);
        expect(listenerMock.mock.calls[0]).toHaveLength(2);
        const [audioDevices, selectedDevice]: [AudioDevice[], AudioDevice] =
          listenerMock.mock.calls[0];
        audioDevices.forEach((audioDevice) => {
          expect(audioDevice).toBeInstanceOf(MockAudioDevice);
        });
        expect(selectedDevice).toBeInstanceOf(MockAudioDevice);
      });
    });

    describe(Constants.VoiceEventCallInvite, () => {
      it('constructs a pending CallInvite', () => {
        new Voice(); // eslint-disable-line no-new

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.callInvite.nativeEvent
        );

        expect(MockCallInvite.mock.instances).toHaveLength(1);
        expect(MockCallInvite.mock.calls).toEqual([
          [createNativeCallInviteInfo(), MockCallInvite.State.Pending],
        ]);
      });

      it('emits a CallInvite', () => {
        const voice = new Voice();
        const listenerMock = jest.fn();
        voice.on(Voice.Event.CallInvite, listenerMock);

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.callInvite.nativeEvent
        );

        expect(listenerMock).toHaveBeenCalledTimes(1);
        expect(listenerMock.mock.calls[0]).toHaveLength(1);
        const [callInvite] = listenerMock.mock.calls[0];
        expect(callInvite).toBeInstanceOf(MockCallInvite);
      });
    });

    describe(Constants.VoiceEventCallInviteAccepted, () => {
      it('constructs an accepted Callinvite and a Call', () => {
        new Voice(); // eslint-disable-line no-new

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.callInviteAccepted.nativeEvent
        );

        const callInviteInfo = createNativeCallInviteInfo();
        const callInfo = {
          uuid: callInviteInfo.uuid,
          customParameters: callInviteInfo.customParameters,
          sid: callInviteInfo.callSid,
          from: callInviteInfo.from,
          to: callInviteInfo.to,
        };

        expect(MockCallInvite.mock.instances).toHaveLength(1);
        expect(MockCallInvite.mock.calls).toEqual([
          [callInviteInfo, MockCallInvite.State.Accepted],
        ]);

        expect(MockCall.mock.instances).toHaveLength(1);
        expect(MockCall.mock.calls).toEqual([[callInfo]]);
      });

      it('emits a Callinvite and a Call', () => {
        const voice = new Voice();
        const listenerMock = jest.fn();
        voice.on(Voice.Event.CallInviteAccepted, listenerMock);

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.callInviteAccepted.nativeEvent
        );

        expect(listenerMock).toHaveBeenCalledTimes(1);
        expect(listenerMock.mock.calls[0]).toHaveLength(2);
        const [callInvite, call] = listenerMock.mock.calls[0];
        expect(callInvite).toBeInstanceOf(MockCallInvite);
        expect(call).toBeInstanceOf(MockCall);
      });
    });

    describe(Constants.VoiceEventCallInviteCancelled, () => {
      it('constructs a CancelledCallInvite', () => {
        new Voice(); // eslint-disable-line no-new

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.cancelledCallInvite.nativeEvent
        );

        expect(MockCancelledCallInvite.mock.instances).toHaveLength(1);
        expect(MockCancelledCallInvite.mock.calls).toEqual([
          [createNativeCancelledCallInviteInfo()],
        ]);

        expect(MockTwilioError.mock.instances).toHaveLength(1);
        expect(MockTwilioError.mock.calls).toEqual([
          [createNativeErrorInfo().message, createNativeErrorInfo().code],
        ]);
      });

      describe('constructs an error', () => {
        it('when there is no error mapping', () => {
          new Voice(); // eslint-disable-line no-new

          mockErrorsByCode.get.mockImplementation(() => undefined);

          const errorEvent = {
            type: Constants.VoiceEventCallInviteCancelled,
            cancelledCallInvite: createNativeCancelledCallInviteInfo(),
            error: { code: 99999, message: 'foobar' },
          };
          MockNativeEventEmitter.emit(Constants.ScopeVoice, errorEvent);

          expect(MockTwilioError.mock.calls).toEqual([
            ['foobar', 99999],
            // this should fail if no code is passed with this message
            // i.e. this is invalid: ['foobar']
          ]);
          expect(MockTwilioError.mock.calls).toHaveLength(
            MockTwilioError.mock.instances.length
          );
        });

        it('when there is an error mapping', () => {
          new Voice(); // eslint-disable-line no-new

          const MockError = jest.fn();
          mockErrorsByCode.get.mockImplementation(() => MockError);

          const errorEvent = {
            type: Constants.VoiceEventCallInviteCancelled,
            cancelledCallInvite: createNativeCancelledCallInviteInfo(),
            error: { code: 99999, message: 'foobar' },
          };
          MockNativeEventEmitter.emit(Constants.ScopeVoice, errorEvent);

          expect(MockError.mock.calls).toEqual([
            ['foobar'],
            // this should fail if a code is passed with this message
            // i.e. this is invalid: ['foobar', 99999]
          ]);
          expect(MockError.mock.calls).toHaveLength(
            MockError.mock.instances.length
          );
        });
      });

      it('emits a CancelledCallInvite and an error', () => {
        const voice = new Voice();
        const listenerMock = jest.fn();
        voice.on(Voice.Event.CancelledCallInvite, listenerMock);

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.cancelledCallInvite.nativeEvent
        );

        expect(listenerMock).toHaveBeenCalledTimes(1);
        expect(listenerMock.mock.calls[0]).toHaveLength(2);
        const [cancelledCallInvite, error] = listenerMock.mock.calls[0];
        expect(cancelledCallInvite).toBeInstanceOf(MockCancelledCallInvite);
        expect(error).toBeInstanceOf(MockTwilioError);
      });
    });

    describe(Constants.VoiceEventCallInviteRejected, () => {
      it('constructs a rejected CallInvite', () => {
        new Voice(); // eslint-disable-line no-new

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.callInviteRejected.nativeEvent
        );

        expect(MockCallInvite.mock.instances).toHaveLength(1);
        expect(MockCallInvite.mock.calls).toEqual([
          [createNativeCallInviteInfo(), MockCallInvite.State.Rejected],
        ]);
      });

      it('emits a CallInvite', () => {
        const voice = new Voice();
        const listenerMock = jest.fn();
        voice.on(Voice.Event.CallInviteRejected, listenerMock);

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.callInviteRejected.nativeEvent
        );

        expect(listenerMock).toHaveBeenCalledTimes(1);
        expect(listenerMock.mock.calls[0]).toHaveLength(1);
        const [callInvite] = listenerMock.mock.calls[0];
        expect(callInvite).toBeInstanceOf(MockCallInvite);
      });
    });

    describe(Constants.VoiceEventError, () => {
      it('emits an error', async () => {
        const voice = new Voice();

        const errorPromise = new Promise((resolve) => {
          voice.on(Voice.Event.Error, resolve);
        });

        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.error.nativeEvent
        );

        const error = await errorPromise;

        expect(typeof error).toBe('object');
      });

      describe('constructs an error', () => {
        it('when there is no error mapping', () => {
          new Voice(); // eslint-disable-line no-new

          mockErrorsByCode.get.mockImplementation(() => undefined);

          const errorEvent = {
            type: Constants.VoiceEventError,
            error: { code: 99999, message: 'foobar' },
          };
          MockNativeEventEmitter.emit(Constants.ScopeVoice, errorEvent);

          expect(MockTwilioError.mock.calls).toEqual([
            ['foobar', 99999],
            // this should fail if no code is passed with this message
            // i.e. this is invalid ['foobar']
          ]);
          expect(MockTwilioError.mock.calls).toHaveLength(
            MockTwilioError.mock.instances.length
          );
        });

        it('when there is an error mapping', () => {
          new Voice(); // eslint-disable-line no-new

          const MockError = jest.fn();
          mockErrorsByCode.get.mockImplementation(() => MockError);

          const errorEvent = {
            type: Constants.VoiceEventError,
            error: { code: 99999, message: 'foobar' },
          };
          MockNativeEventEmitter.emit(Constants.ScopeVoice, errorEvent);

          expect(MockError.mock.calls).toEqual([
            ['foobar'],
            // this should fail if a code is passed with this message
            // i.e. this is invalid ['foobar', 99999]
          ]);
          expect(MockError.mock.calls).toHaveLength(
            MockError.mock.instances.length
          );
        });
      });
    });

    describe(Constants.VoiceEventRegistered, () => {
      it('emits the event', () => {
        const voice = new Voice();
        const listenerMock = jest.fn();
        voice.on(Voice.Event.Registered, listenerMock);
        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.registered.nativeEvent
        );
        expect(listenerMock.mock.calls).toEqual([[]]);
      });
    });

    describe(Constants.VoiceEventUnregistered, () => {
      it('emits the event', () => {
        const voice = new Voice();
        const listenerMock = jest.fn();
        voice.on(Voice.Event.Unregistered, listenerMock);
        MockNativeEventEmitter.emit(
          Constants.ScopeVoice,
          mockVoiceNativeEvents.unregistered.nativeEvent
        );
        expect(listenerMock.mock.calls).toEqual([[]]);
      });
    });
  });

  describe('on receiving an invalid native event', () => {
    it('throws an error', () => {
      new Voice(); // eslint-disable-line no-new
      expect(() =>
        MockNativeEventEmitter.emit(Constants.ScopeVoice, {
          type: 'mock-voice-eventtype',
        })
      ).toThrowError(
        'Unknown voice event type received from the native layer: ' +
          '"mock-voice-eventtype".'
      );
    });
  });

  describe('public methods', () => {
    describe('.connect', () => {
      it.each([
        [
          'mock-voice-token-foo',
          { foo: 'bar' },
          ['mock-voice-token-foo', { foo: 'bar' }],
        ],
        ['mock-voice-token-bar', undefined, ['mock-voice-token-bar', {}]],
      ])(
        'invokes the native module with params ("%s", %o)',
        (token, params, expectation) => {
          new Voice().connect(token, params);
          expect(MockNativeModule.voice_connect.mock.calls).toEqual([
            expectation,
          ]);
        }
      );

      it('returns a Promise<Call>', async () => {
        const token = 'mock-voice-token';
        const voice = new Voice();
        const connectPromise = voice.connect(token);
        await expect(connectPromise).resolves.toBeInstanceOf(MockCall);
      });
    });

    describe('.getVersion', () => {
      it('invokes the native module', () => {
        new Voice().getVersion();
        expect(MockNativeModule.voice_getVersion.mock.calls).toEqual([[]]);
      });

      it('returns a Promise<string>', async () => {
        const versionPromise = new Voice().getVersion();
        await expect(versionPromise).resolves.toBe('mock-nativemodule-version');
      });
    });

    describe('.getDeviceToken', () => {
      it('invokes the native module', () => {
        new Voice().getDeviceToken();
        expect(MockNativeModule.voice_getDeviceToken.mock.calls).toEqual([[]]);
      });

      it('returns a Promise<string>', async () => {
        const deviceTokenPromise = new Voice().getDeviceToken();
        await expect(deviceTokenPromise).resolves.toBe(
          'mock-nativemodule-devicetoken'
        );
      });
    });

    describe('.getCalls', () => {
      it('invokes the native module', async () => {
        await new Voice().getCalls();
        expect(MockNativeModule.voice_getCalls.mock.calls).toEqual([[]]);
      });

      it('returns a Promise<Map<Uuid, Call>>', async () => {
        const calls = await new Voice().getCalls();
        expect(calls).toBeInstanceOf(Map);
        for (const [uuid, call] of calls.entries()) {
          expect(uuid).toBe('mock-nativecallinfo-uuid');
          expect(call).toBeInstanceOf(MockCall);
        }
        expect(MockCall.mock.instances).toHaveLength(calls.size);
      });
    });

    describe('.getCallInvites', () => {
      it('invokes the native module', async () => {
        await new Voice().getCallInvites();
        expect(MockNativeModule.voice_getCallInvites.mock.calls).toEqual([[]]);
      });

      it('returns a Promise<Map<Uuid, CallInvite>>', async () => {
        const callInvites = await new Voice().getCallInvites();
        expect(callInvites).toBeInstanceOf(Map);
        for (const [uuid, callInvite] of callInvites.entries()) {
          expect(uuid).toBe('mock-nativecallinviteinfo-uuid');
          expect(callInvite).toBeInstanceOf(MockCallInvite);
        }
        expect(MockCallInvite.mock.instances).toHaveLength(callInvites.size);
      });
    });

    describe('.register', () => {
      it('invokes the native module', async () => {
        await new Voice().register('mock-voice-token');
        expect(MockNativeModule.voice_register.mock.calls).toEqual([
          ['mock-voice-token'],
        ]);
      });

      it('returns a Promise<void>', async () => {
        const registerPromise = new Voice().register('mock-voice-token');
        await expect(registerPromise).resolves.toBeUndefined();
      });
    });

    describe('.unregister', () => {
      it('invokes the native module', async () => {
        await new Voice().unregister('mock-voice-token');
        expect(MockNativeModule.voice_unregister.mock.calls).toEqual([
          ['mock-voice-token'],
        ]);
      });

      it('returns a Promise<void>', async () => {
        const registerPromise = new Voice().unregister('mock-voice-token');
        await expect(registerPromise).resolves.toBeUndefined();
      });
    });

    describe('.getAudioDevice', () => {
      it('invokes the native module', async () => {
        await new Voice().getAudioDevices();
        expect(MockNativeModule.voice_getAudioDevices.mock.calls).toEqual([[]]);
      });

      it('returns a Promise resolving with audio devices info', async () => {
        const { audioDevices, selectedDevice } =
          await new Voice().getAudioDevices();

        expect(Array.isArray(audioDevices)).toBe(true);

        const allDevices =
          selectedDevice === null
            ? audioDevices
            : [...audioDevices, selectedDevice];
        for (const audioDevice of allDevices) {
          expect(audioDevice).toBeInstanceOf(MockAudioDevice);
        }
      });
    });

    describe('.showAvRoutePickerView', () => {
      it('invokes the native module', async () => {
        await new Voice().showAvRoutePickerView();
        expect(
          MockNativeModule.voice_showNativeAvRoutePicker.mock.calls
        ).toEqual([[]]);
      });

      it('returns a Promise<void>', async () => {
        const showAvRoutePickerViewPromise =
          new Voice().showAvRoutePickerView();
        await expect(showAvRoutePickerViewPromise).resolves.toBeUndefined();
      });
    });
  });

  describe('private methods', () => {
    /**
     * Invalid event tests.
     */
    [
      '_handleNativeEvent',
      '_handleAudioDevicesUpdated',
      '_handleCallInvite',
      '_handleCallInviteAccepted',
      '_handleCallInviteRejected',
      '_handleCancelledCallInvite',
      '_handleError',
      '_handleRegistered',
      '_handleUnregistered',
    ].forEach((privateMethodKey) => {
      describe(`.${privateMethodKey}`, () => {
        it('throws an error for an invalid event', () => {
          const handler = (new Voice() as any)[privateMethodKey];
          expect(typeof handler).toBe('function');
          expect(() => {
            handler({ type: 'not-a-real-event' });
          }).toThrow();
        });
      });
    });
  });
});

describe('Voice namespace', () => {
  describe('exports enumerations', () => {
    it('Event', () => {
      expect(Voice.Event).toBeDefined();
      expect(typeof Voice.Event).toBe('object');
    });
  });
});
