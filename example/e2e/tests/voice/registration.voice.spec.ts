import { by, element, waitFor } from 'detox';

export const DEFAULT_TIME_OUT = 10000;

async function isVisibleByText(text: string, timeout: number = DEFAULT_TIME_OUT) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(timeout);
}

describe('registration', () => {
    it('successfully registers', async () => {
        await isVisibleByText('Registered: false');
        await isVisibleByText('Register');
        await element(by.text('Register')).tap();
        await isVisibleByText('Registered: true');
    });

    it('succesfully unregisters', async () => {
        await isVisibleByText('Registered: true');
        await isVisibleByText('Unregister');
        await element(by.text('Unregister')).tap();
        await isVisibleByText('Registered: false');
    });
});
