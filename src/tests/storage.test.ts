
import { W3, getStorage, testAccounts } from '../';
import { DummyContract } from '../contracts';
import * as ganache from 'ganache-cli';
// import { Storage } from '../contracts';

let w3 = new W3(ganache.provider({
    mnemonic: 'dbrainio',
    network_id: 314
}));
W3.default = w3;

let activeAccount = testAccounts[0];
w3.defaultAccount = activeAccount;
let deployParams = W3.TX.txParamsDefaultDeploy(activeAccount);
let sendParams = W3.TX.txParamsDefaultSend(activeAccount);

beforeEach(async () => {
    // Ropsten is SLOW compared to TestRPC
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;
    if ((await w3.networkId) === '1') {
        console.log('Working on mainnet');
    }
    expect((await w3.networkId)).not.toBe('1');
});

it('Storage: Could get storage for account', async () => {
    let store = await getStorage(w3, activeAccount);
    // console.log('STORAGE: ', storage);
    let key = W3.EthUtils.bufferToHex(W3.EthUtils.sha3('record'));
    console.log('KEY: ', key);
    let tx = await store.setStringValue(key, 'record value', sendParams);
    console.log('TX: ', tx);
    let stored = await store.getStringValue(key, sendParams);
    console.log('STORED: ', stored);
    expect(stored).toBe('record value');
});

it('Storage: Could get contract hash', async () => {
    let store = await getStorage(w3, activeAccount);
    let hash = DummyContract.bytecodeHash;
    // console.log('HASH: ', hash);
    let manualHash = W3.sha3(JSON.stringify(DummyContract.artifacts.bytecode));
    expect(manualHash).toBe(hash);

    // pattern to store addresses of a contract and reuse them if bytecode is not changed
    // note that ctor params require unique hash work
    let ctorParams = { _secret: 123, _wellKnown: 42, _array: [1, 2, 3] };
    let contractHash = W3.sha3(hash! + JSON.stringify(ctorParams));

    let dummy: DummyContract;
    let address = await store.getAddressValue(contractHash);
    console.log('STORED ADDRESS', address);
    if (address === W3.zeroAddress) {
        dummy = await DummyContract.new(deployParams, ctorParams, w3);
        await dummy.instance;
        address = await dummy.address;
        await store.setAddressValue(contractHash, address);
    } else {
        dummy = await DummyContract.at(address, w3);
        dummy.getPublic();
    }
    // expect(await dummy.address).toBe(address);
    console.log('ADDR', address);
});
