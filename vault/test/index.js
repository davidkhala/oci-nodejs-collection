import assert from 'assert';
import {Vault, Key} from '../index.js';
import {SimpleAuthentication} from '../../common/index.js';
import {execSync} from '@davidkhala/light/devOps.js';
import crypto from 'crypto';

const auth = new SimpleAuthentication(process.env);
const compartmentId = 'ocid1.tenancy.oc1..aaaaaaaaji4ohhurx2uydbjbvd2skio5ad5tp2nvu4azii2oy5tu5aol4phq';
describe('vault', () => {
	const vault = new Vault(auth);
	before(async () => {
		const health = await auth.connect();
		assert.ok(health);
	});
	it('list', async () => {


		const result = await vault.list(compartmentId);
		console.debug(result);
	});
});
describe('key', function () {
	this.timeout(0);
	const vaultId = 'ocid1.vault.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrk57oclvejakgkh42rblwi7dmymmhnfrmt7nmloagt24mcrpl236q';

	const vault = new Vault(auth);
	let oneVault;
	before(async () => {
		const health = await auth.connect();
		assert.ok(health);
		oneVault = await vault.get(vaultId);
	});
	it('list', async () => {

		const key = new Key(auth, oneVault);

		const keyList = await key.list();
		console.debug(keyList);
	});
	it('ecdsa sign and verify', async () => {
		// ec key
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrizggn5jlznyv7j64ccchehu6wc6vmfllyobilups4ahhp34pzyqq';
		const key = new Key(auth, oneVault, keyID);
		const message = 'EXAMPLE-message-Value';
		const signature = await key.sign(message);
		console.info(signature);
		console.info(signature.length);
		// MEQCIDbhOG7/NBh4JnkUXQVNL/fbMZTBjwYuWA4WMgrcHojkAiBnlXTUrQMnscQHyQNGzMJSHvmEOcXAE7QSwOQxopROzw==
		const result = await key.verify(signature, message);
		assert.ok(result);
	});
	it('ecdsa sign and verify: digest(sha256):digest cannot be longer than 32 bytes', async () => {
		// WARN: hex encoding make digest too long, please use default one
		const sha2_256 = (data) => crypto.createHash('sha256').update(data).digest();

		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrizggn5jlznyv7j64ccchehu6wc6vmfllyobilups4ahhp34pzyqq';
		const key = new Key(auth, oneVault, keyID);
		const message = sha2_256('EXAMPLE-message-Value');
		const signature = await key.sign(message, undefined, undefined, true);
		// MEYCIQCzY/lK3X4PID792dNpgVPayWPo86NhR2WDHDnKufWDAQIhAP+89Ur8xh+3+JNeaY47zRgMC34ptxvQZDHSsDuxzrtp
		console.info(signature);
		console.info(signature.length);
		const result = await key.verify(signature, message, undefined, undefined, true);
		assert.ok(result);
	});
	it('inspect ec', async () => {
		// ec key
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrizggn5jlznyv7j64ccchehu6wc6vmfllyobilups4ahhp34pzyqq';
		const key = new Key(auth, oneVault, keyID);
		const keyInfo = await key.get();
		assert.strictEqual(keyInfo.keyShape.algorithm, 'ECDSA');

	});
	it('rsa inspect', async () => {
		// rsa key
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrh263ohsu2o7rfg4eel67wcc6akv4575e52atvziwnh2qchrm6icq';
		const key = new Key(auth, oneVault, keyID);
		const keyInfo = await key.get();
		assert.strictEqual(keyInfo.keyShape.algorithm, 'RSA');
		console.debug(keyInfo);
	});
	it('rsa sign and verify', async () => {
		// rsa key
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrh263ohsu2o7rfg4eel67wcc6akv4575e52atvziwnh2qchrm6icq';
		const key = new Key(auth, oneVault, keyID);
		const message = 'EXAMPLE-message-Value';

		const signature = await key.sign(message);
		const result = await key.verify(signature, message,);
		assert.ok(result);
	});
	it('key export', async () => {
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrizggn5jlznyv7j64ccchehu6wc6vmfllyobilups4ahhp34pzyqq';
		const key = new Key(auth, oneVault, keyID);
		const resp = await key.export();
		console.debug(resp);
	});
});

describe('cli', function () {
	this.timeout(0);
	it('RSA sign', async () => {
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrh263ohsu2o7rfg4eel67wcc6akv4575e52atvziwnh2qchrm6icq';
		const message = Buffer.from('EXAMPLE-message-Value').toString('base64');

		const pss = 'SHA_256_RSA_PKCS_PSS';
		const endpoint = 'https://enrhpwtoaabem-crypto.kms.ap-singapore-1.oci.oraclecloud.com';
		const cmd = `oci kms crypto signed-data sign --key-id ${keyID} --message ${message} --signing-algorithm ${pss} --endpoint ${endpoint}`;
		const {data} = JSON.parse(execSync(cmd));
		console.info(data);
	});

});
