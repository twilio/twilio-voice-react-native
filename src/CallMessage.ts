/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

//@ts-ignore
import { Constants } from './constants';
import type { NativeCallMessageInfo } from './type/CallMessage';

/**
 * Provides access to information about a callMessage, including the call
 * message content, contentType, messageType, and voiceEventSid
 *
 * @remarks
 * Note that the callMessage information is fetched as soon as possible from the
 * native layer, but there is no guarantee that all information is immediately
 * available. Methods such as `CallMessage.getContent` or `CallMessage.getSid`
 * may return `undefined`.
 *
 * @public
 */
export class CallMessage {
  /**
   * Content body of the message
   */
  public _content: string;

  /**
   * MIME type for the message
   */
  public _contentType: CallMessage.ContentType;

  /**
   * Message type
   */
  public _messageType: CallMessage.MessageType;

  /**
   * Unique identifier of the message
   */
  public _voiceEventSid?: string;

  /**
   * Constructor for the {@link (CallMessage:class) | CallMessage class}. This should
   * not be invoked by third-party code.
   *
   * @param NativeCallMessageInfo - An object containing all of the data from the
   * native layer necessary to fully describe a callMessage, as well as invoke native
   * functionality for the callMessage.
   *
   * @internal
   */
  constructor({
    content,
    contentType,
    messageType,
    voiceEventSid,
  }: NativeCallMessageInfo) {
    this._content = content;
    this._contentType = contentType;
    this._messageType = messageType;
    this._voiceEventSid = voiceEventSid;
  }

  /**
   * Get the content body of the message.
   * @returns
   * - A string representing the content body of the message.
   */
  getContent(): string {
    return this._content;
  }

  /**
   * Get the MIME type for the message.
   * @returns
   * - A {@link (CallMessage:namespace).ContentType}.
   */
  getContentType(): CallMessage.ContentType {
    return this._contentType;
  }

  /**
   * Get the message type.
   * @returns
   * - A {@link (CallMessage:namespace).MessageType}.
   */
  getMessageType(): CallMessage.MessageType {
    return this._messageType;
  }

  /**
   * Get the message SID.
   * @returns
   * - A string representing the message SID.
   * - `undefined` if the call information has not yet been received from the
   *   native layer.
   */
  getSid(): string | undefined {
    return this._voiceEventSid;
  }
}

/**
 * Namespace for enumerations and types used by
 * {@link (CallMessage:class) | CallMessage objects}.
 *
 * @remarks
 *  - See also the {@link (CallMessage:class) | CallMessage class}.
 *
 * @public
 */
export namespace CallMessage {
  export enum MessageType {
    'UserDefinedMessage' = Constants.UserDefinedMessage,
  }

  export enum ContentType {
    'ApplicationJson' = Constants.ApplicationJson,
  }
}
