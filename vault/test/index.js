import {Vault, Key} from '../index.js'
import {SimpleAuthentication} from '../../common/index.js'
import assert from 'assert'

const auth = new SimpleAuthentication(process.env)
const compartmentId = 'ocid1.tenancy.oc1..aaaaaaaaji4ohhurx2uydbjbvd2skio5ad5tp2nvu4azii2oy5tu5aol4phq'
describe('vault', () => {
	const vault = new Vault(auth)
	before(async () => {
		const health = await auth.connect()
		assert.ok(health)
	})
	it('list', async () => {


		const result = await vault.list(compartmentId)
		console.debug(result)
	})
})
describe('key', function () {
	this.timeout(0)
	const vaultId = 'ocid1.vault.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrk57oclvejakgkh42rblwi7dmymmhnfrmt7nmloagt24mcrpl236q'

	const vault = new Vault(auth)
	let oneVault
	before(async () => {
		const health = await auth.connect()
		assert.ok(health)
		oneVault = await vault.get(vaultId)
	})
	it('list', async () => {

		const key = new Key(auth, oneVault)

		const keyList = await key.list(compartmentId)
		console.debug(keyList)
	})
	it('ecdsa sign and verify', async () => {
		// ec key
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrizggn5jlznyv7j64ccchehu6wc6vmfllyobilups4ahhp34pzyqq'
		const key = new Key(auth, oneVault)
		const message = 'EXAMPLE-message-Value'
		const signature = await key.sign(keyID, message)

		const result = await key.verify(keyID, signature, message)
		assert.ok(result)
	})
	it('inspect ec', async () => {
		// ec key
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrizggn5jlznyv7j64ccchehu6wc6vmfllyobilups4ahhp34pzyqq'
		const key = new Key(auth, oneVault)
		const keyInfo = await key.get(keyID)
		assert.strictEqual(keyInfo.keyShape.algorithm, 'ECDSA')

	})
	it('rsa inspect', async () => {
		// rsa key
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrh263ohsu2o7rfg4eel67wcc6akv4575e52atvziwnh2qchrm6icq'
		const key = new Key(auth, oneVault)
		const keyInfo = await key.get(keyID)
		assert.strictEqual(keyInfo.keyShape.algorithm, 'RSA')
		console.debug(keyInfo)
	})
	it('rsa sign and verify', async () => {
		// rsa key
		const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrh263ohsu2o7rfg4eel67wcc6akv4575e52atvziwnh2qchrm6icq'
		const key = new Key(auth, oneVault)
		const message = 'EXAMPLE-message-Value'
		const signature = await key.sign(keyID, message)

		const result = await key.verify(keyID, signature, message)
		assert.ok(result)
	})
})