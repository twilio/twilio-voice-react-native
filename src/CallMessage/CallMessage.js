/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
import { InvalidArgumentError } from '../error/InvalidArgumentError';
/**
 * Parse CallMessage values. Used when constructing a CallMessage from the
 * native layer, or by the Call and CallInvite classes when sending a
 * CallMessage.
 *
 * @param message the CallMessage details.
 *
 * @internal
 */
export function validateCallMessage(message) {
    const content = message.content;
    const messageType = message.messageType;
    let contentType = message.contentType;
    if (typeof contentType === 'undefined') {
        contentType = 'application/json';
    }
    if (typeof contentType !== 'string') {
        throw new InvalidArgumentError('If "contentType" is present, it must be of type "string".');
    }
    if (typeof messageType !== 'string') {
        throw new InvalidArgumentError('"messageType" must be of type "string".');
    }
    if (typeof content === 'undefined' || content === null) {
        throw new InvalidArgumentError('"content" must be defined and not "null".');
    }
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    return { content: contentStr, contentType, messageType };
}
