// @ts-nocheck

export const DEFAULT_TIME_OUT = 10000;

export async function isVisibleByText(text: string, timeout: number = DEFAULT_TIME_OUT) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(timeout);
}

describe('Registration APIs', () => {
    let accessToken: string;

    beforeAll(async () => {

    });
    beforeEach(async () => {

    });
    it('Voice | Registration | :ios:', async () => {
        await isVisibleByText('Registered: false', DEFAULT_TIME_OUT);
        await isVisibleByText('Register', DEFAULT_TIME_OUT);
        await element(by.text('Register')).tap();
        await isVisibleByText('Registered: true', DEFAULT_TIME_OUT);
    });
    it('Voice | Unregistration | :ios:', async () => {
        await isVisibleByText('Registered: true', DEFAULT_TIME_OUT);
        await isVisibleByText('Unregister', DEFAULT_TIME_OUT);
        await element(by.text('Unregister')).tap();
        await isVisibleByText('Registered: false', DEFAULT_TIME_OUT);
    });
    afterEach(async () => {

    });
});
