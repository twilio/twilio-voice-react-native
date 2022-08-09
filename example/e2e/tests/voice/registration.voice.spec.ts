import {generateAccessToken} from '../../commons/tokenUtility.ts';

describe('Registration APIs', () => {
    beforeAll(async () => {
        console.log("beforeAll");
        let token = generateAccessToken('john');
        console.log(token);
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
