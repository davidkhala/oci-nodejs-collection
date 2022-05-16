import {SimpleAuthentication, FileAuthentication, AbstractService} from '../index.js'
import {IdentityClient, IdentityWaiter} from "oci-identity"
import assert from "assert";

const tenancy = 'ocid1.tenancy.oc1..aaaaaaaakatveh74zmu3624wgdcs2zcud5emtkpeqrv3b4xnc6gwlw52nvtq'
const user = 'ocid1.user.oc1..aaaaaaaagu3ghstfw5oynuruw6hudunbjsmroyko6ue6lnshxumwskv2ipjq'

const regionId = 'ap-seoul-1';
describe('auth', function () {
	this.timeout(0)

	it('simpleAuth', async () => {
		const {privateKey, fingerprint} = process.env
		const auth = new SimpleAuthentication({tenancy, user, fingerprint, privateKey, regionId});

		const client = await auth.connect()
	})
	it('simpleAuth: file based', async () => {

		const auth = new SimpleAuthentication();
		console.debug(auth.provider.getPrivateKey())
		console.debug(auth.provider.getFingerprint())
	})

})

describe('san check', function () {
	this.timeout(0)
	it('Abstract Class', async () => {
		const abstractService = new AbstractService({provider: undefined}, IdentityClient)
		abstractService.withWaiter(IdentityWaiter)
	})
	it('local credential exist', async () => {
		if (process.env.CI) {
			// skip for Github workflow
			return
		}
		const auth = new FileAuthentication()
		assert.ok(auth.validate())
		const isAvailable = await auth.connect()
		assert.ok(isAvailable)
	})
})

