import { by, element, waitFor } from 'detox';

export const DEFAULT_TIME_OUT = 10000;

async function isVisibleByText(text: string, timeout: number = DEFAULT_TIME_OUT) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(timeout);
}

describe('Voice & Call APIs', () => {
    it('Voice | Connect | :ios:', async () => {
        await isVisibleByText('State: undefined');
        await isVisibleByText('SID: undefined');
        await isVisibleByText('Connect');
        await element(by.text('Connect')).tap();
        await isVisibleByText('State: ringing');
        await isVisibleByText('State: connected');
        await isVisibleByText('Disconnect');
        await element(by.text('Disconnect')).tap();
        await isVisibleByText('State: disconnected');
    });
});
