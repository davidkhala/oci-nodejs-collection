import {LogGroup, Log} from '../logGroup.js'
import {SimpleAuthentication} from "@davidkhala/oci-common"

describe('logGroup', function () {
	this.timeout(0)
	const auth = new SimpleAuthentication()
	const logGroup = new LogGroup(auth)
	const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea'
	it('create & delete', async () => {
		const name = 'temp'
		const ocid = await logGroup.create(compartmentId, name)

		await logGroup.delete(ocid)
	})
	it('list', async () => {
		const items = await logGroup.list(compartmentId)
		console.debug(items.map(({id}) => id))
	})
	it('clear', async () => {
		await logGroup.clear(compartmentId)
	})

})
describe('log item', function () {
	this.timeout(0)
	const logGroupName = 'temp'
	const auth = new SimpleAuthentication()
	const logGroup = new LogGroup(auth)
	const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea'
	let logGroupId, log
	before(async () => {
		logGroupId = await logGroup.create(compartmentId, logGroupName)
		log = new Log(auth, logGroupId)
	})
	it('create log item', async () => {

		await log.create('log')
	})
	it('clear log items', async () => {
		await log.clear()

	})

	after(async () => {
		await logGroup.delete(logGroupId)
	})
})
describe('write log', function () {
	this.timeout(0)
	const endpoint = 'https://ingestion.logging.ap-seoul-1.oci.oraclecloud.com'


})
