import { DummyContract } from '../contracts';
import { W3, testAccounts } from '../';
import * as ganache from 'ganache-cli';

let w3 = new W3(ganache.provider({
    mnemonic: 'dbrainio',
    network_id: 314
}));
w3.defaultAccount = testAccounts[0];
W3.default = w3;

describe('ArrayTypes', () => {
    let arrayTypesContract: DummyContract;
    const arrayInt = [1, 2, 3];
    const arrayAddress = ['0xf209400320be8eccdc0eac7b5358631bc328799f', '0xf3488e96d8766f8cdc92775b4d9babf77bdcbb65'];

    beforeAll(async () => {
        arrayTypesContract = await DummyContract.new(
            W3.TX.txParamsDefaultDeploy(testAccounts[0]),
            { _secret: 123, _wellKnown: 456, _array: arrayInt }
        );
    });

    it('should return array correctly', async () => {
        let res = await arrayTypesContract.array(2);
        expect(res.toNumber()).toEqual(arrayInt[2]);
    });

    it('should return array from function correctly', async () => {
        let res = await arrayTypesContract.funcArrayInArguments(arrayAddress);
        expect(res).toEqual(arrayAddress);
    });
});
