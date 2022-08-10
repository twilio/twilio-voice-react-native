// @ts-nocheck

import {generateAccessToken} from '../../common/TokenUtility';

describe('Registration APIs', () => {
    let accessToken: string;

    beforeAll(async () => {
        console.log("beforeAll");
        accessToken = generateAccessToken('john');
    });
    beforeEach(async () => {
        console.log("beforeEach");
    });
    it('Voice | Registration | :ios:', async () => {
        console.log("debug checkpoint");
    });
    afterEach(async () => {
        console.log("afterEach");
    });
});
