/**
 * Copyright (c) Twilio Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { NativeModule } from './common';
import type { NativeAudioDeviceInfo } from './type/AudioDevice';
import type { Uuid } from './type/common';

/**
 * Describes audio devices as reported by the native layer and allows the
 * native selection of the described audio device.
 *
 * @remarks
 *  - See the {@link (AudioDevice:namespace) | AudioDevice namespace} for types
 *    used by this class.
 *
 * @public
 */
export class AudioDevice {
  /**
   * The native-UUID of this object. This is generated by the native layer and
   * is used to associate functionality between the JS and native layers.
   *
   * @internal
   */
  uuid: Uuid;

  /**
   * The type of the audio device.
   */
  type: AudioDevice.Type;

  /**
   * The name of the audio device.
   */
  name: string;

  /**
   * Audio device class constructor.
   * @param audioDeviceInformation - A record describing an audio device.
   *
   * @internal
   */
  constructor({ uuid, type, name }: NativeAudioDeviceInfo) {
    this.uuid = uuid;
    this.type = type;
    this.name = name;
  }

  /**
   * Select the audio device as described by the data fields in this object.
   * @returns
   *  - Resolves with `void` when the audio device has been successfully
   *    selected.
   */
  select(): Promise<void> {
    return NativeModule.voice_selectAudioDevice(this.uuid);
  }
}

/**
 * Audio device namespace. Contains interfaces and enumerations associated with
 * audio devices.
 *
 * @public
 */
export namespace AudioDevice {
  /**
   * Audio device type enumeration. Describes all possible audio device types as
   * reported by the native layer.
   */
  export enum Type {
    Earpiece = 'earpiece',
    Speaker = 'speaker',
    Bluetooth = 'bluetooth',
  }
}
