/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'node ./node_modules/jest/bin/jest.js',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000,
      reportSpecs: false,
      reportWorkerAssign: false,
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/TwilioVoiceReactNativeExample.app',
      build: 'xcodebuild -workspace ios/TwilioVoiceReactNativeExample.xcworkspace -scheme TwilioVoiceReactNativeExample -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -quiet -arch x86_64'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/TwilioVoiceReactNativeExample.app',
      build: 'xcodebuild -workspace ios/TwilioVoiceReactNativeExample.xcworkspace -scheme TwilioVoiceReactNativeExample -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -quiet -arch x86_64'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android ; ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug ; cd ..',
      reversePorts: [
        8081
      ]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android ; ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release ; cd ..'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 12 Pro Max'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'rn-sdk-integration-tests-avd'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug'
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release'
    }
  }
};
