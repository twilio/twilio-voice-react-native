/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { InvalidArgumentError } from '../error/InvalidArgumentError';

/**
 * The constituent values of a Call Message.
 *
 * @public
 */
export interface CallMessage {
  /**
   * The content of the message. This value should match the content type
   * parameter.
   *
   * See {@link CallMessage.contentType} for more information.
   */
  content: any;

  /**
   * The content type of the message. This value should accurately describe
   * the content of the message. The following values are accepted:
   *
   * - "application/json"
   *
   * If no value is defined, then the default value of "application/json" will
   * be used.
   */
  contentType?: string;

  /**
   * The message type. The following values are accepted:
   *
   * - "user-defined-message"
   */
  messageType: string;
}

/**
 * Parse CallMessage values. Used when constructing a CallMessage from the
 * native layer, or by the Call and CallInvite classes when sending a
 * CallMessage.
 *
 * @param message the CallMessage details.
 *
 * @internal
 */
export function validateCallMessage(message: CallMessage) {
  const content = message.content;
  const messageType = message.messageType;

  let contentType = message.contentType;

  if (typeof contentType === 'undefined') {
    contentType = 'application/json';
  }

  if (typeof contentType !== 'string') {
    throw new InvalidArgumentError(
      'If "contentType" is present, it must be of type "string".'
    );
  }

  if (typeof messageType !== 'string') {
    throw new InvalidArgumentError('"messageType" must be of type "string".');
  }

  if (typeof content === 'undefined' || content === null) {
    throw new InvalidArgumentError('"content" must be defined and not "null".');
  }

  return { content, contentType, messageType };
}

/**
 * Invalid event list error message. To be used as the message when constructing
 * the InvalidArgumentError that should be thrown when an invalid event list is
 * passed to the SDK.
 */
export const invalidCallMessageEventsErrorMessage =
  'Optional argument "callMessageEvents" must of type "array" and contain ' +
  'only elements of type "string".';

/**
 * Type-guard function that uses type predicates to ensure that a passed value
 * is indeed an array of strings.
 *
 * @param callMessageEvents the parameter to type-guard on
 *
 * @returns a type-predicate boolean representing whether or not the value is an
 * array of strings.
 */
export function validateCallMessageEvents(
  callMessageEvents: any
): callMessageEvents is string[] {
  if (typeof callMessageEvents !== 'object') {
    return false;
  }

  if (!Array.isArray(callMessageEvents)) {
    return false;
  }

  for (const el of callMessageEvents) {
    if (typeof el !== 'string') {
      return false;
    }
  }

  return true;
}
