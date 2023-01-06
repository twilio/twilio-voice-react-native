import UITestUtility from '../utility/UITestUtility';

const REGISTER_BUTTON_ID = 'registerButton';
const UNREGISTER_BUTTON_ID = 'unregisterButton';

describe('Registration APIs', () => {
    it('Voice | Registration', async () => {
        await UITestUtility.isVisibleByText('Registered: false');
        await UITestUtility.isVisibleById(REGISTER_BUTTON_ID);
        await element(by.id(REGISTER_BUTTON_ID)).tap();
        await UITestUtility.isVisibleByText('Registered: true');
    });
    it('Voice | Unregistration', async () => {
        await UITestUtility.isVisibleByText('Registered: true');
        await UITestUtility.isVisibleById(UNREGISTER_BUTTON_ID);
        await element(by.id(UNREGISTER_BUTTON_ID)).tap();
        await UITestUtility.isVisibleByText('Registered: false');
    });
});
