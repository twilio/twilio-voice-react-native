// @ts-nocheck

import {generateAccessToken} from '../../common/TokenUtility';

export const DEFAULT_TIME_OUT = 10000;

export async function isVisibleByText(text: string, timeout: number = DEFAULT_TIME_OUT) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(timeout);
}

describe('Registration APIs', () => {
    let accessToken: string;

    beforeAll(async () => {
        accessToken = generateAccessToken('john');
    });
    beforeEach(async () => {

    });
    it('Voice | Registration | :ios:', async () => {
        await isVisibleByText('Register', DEFAULT_TIME_OUT);
        await element(by.text('Register')).tap();
    });
    it('Voice | Unregistration | :ios:', async () => {
        await isVisibleByText('Unregister', DEFAULT_TIME_OUT);
        await element(by.text('Unregister')).tap();
    });
    afterEach(async () => {

    });
});
