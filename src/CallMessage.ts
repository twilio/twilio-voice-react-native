/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import type { NativeCallMessageInfo } from './type/CallMessage';

/**
 * Provides access to information about a callMessage, including the call
 * message content, contentType, messageType, and messageSID
 *
 * @remarks
 * Note that the callMessage information is fetched as soon as possible from the
 * native layer, but there is no guarantee that all information is immediately
 * available. Methods such as `CallMessage.getContent` or `CallMessage.getMessageSID`
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
  public _contentType: string;

  /**
   * Message type
   */
  public _messageType: string;

  /**
   * Unique identifier of the message
   */
  public _messageSID: string;

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
    callMessageContent,
    callMessageContentType,
    callMessageType,
    callMessageSID,
  }: NativeCallMessageInfo) {
    this._content = callMessageContent;
    this._contentType = callMessageContentType;
    this._messageType = callMessageType;
    this._messageSID = callMessageSID;
  }

  /**
   * Get the content body of the message.
   * @returns
   * - A string representing the content body of the message.
   * - `undefined` if the callMessage state has not yet been received from the
   *   native layer.
   */
  getContent(): string | undefined {
    return this._content;
  }

  /**
   * Get the MIME type for the message.
   * @returns
   * - A string representing the MIME type for the message.
   * - `undefined` if the callMessage state has not yet been received from the
   *   native layer.
   */
  getContentType(): string | undefined {
    return this._contentType;
  }

  /**
   * Get the message type.
   * @returns
   * - A string representing the message type.
   * - `undefined` if the callMessage state has not yet been received from the
   *   native layer.
   */
  getMessageType(): string | undefined {
    return this._messageType;
  }

  /**
   * Get the message SID.
   * @returns
   * - A string representing the message SID.
   * - `undefined` if the callMessage state has not yet been received from the
   *   native layer.
   */
  getMessageSID(): string | undefined {
    return this._messageSID;
  }
}
