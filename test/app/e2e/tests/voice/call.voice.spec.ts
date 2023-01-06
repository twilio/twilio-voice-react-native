import UITestUtility from '../utility/UITestUtility';

const CONNECT_BUTTON_ID = 'connectButton';
const DISCONNECT_BUTTON_ID = 'disconnectButton';

describe('Voice & Call APIs', () => {
    it('Voice | Connect', async () => {
        await UITestUtility.isVisibleByText('State: undefined');
        await UITestUtility.isVisibleByText('SID: undefined');
        await UITestUtility.isVisibleById(CONNECT_BUTTON_ID);
        await element(by.id(CONNECT_BUTTON_ID)).tap();
        await UITestUtility.isVisibleByText('State: connected');
        await UITestUtility.isVisibleById(DISCONNECT_BUTTON_ID);
        await element(by.id(DISCONNECT_BUTTON_ID)).tap();
        await UITestUtility.isVisibleByText('State: disconnected');
    });
});
