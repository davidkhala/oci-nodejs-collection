import {LogGroup, Log} from '../logGroup.js'
import {SimpleAuthentication} from "@davidkhala/oci-common"
import {log} from '../simpleLogger.js'
import assert from "assert";

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
	it('create if not exist', async () => {
		const name = 'temp'
		const ocid = await logGroup.create(compartmentId, name)
		console.debug(ocid)
	})
	it('create anonymous and failed', async () => {
		try {
			await logGroup.create(compartmentId)
		} catch (e) {
			const {serviceCode, statusCode, message} = e
			assert.strictEqual(statusCode, 400)
			assert.strictEqual(serviceCode, 'InvalidParameter')
			assert.strictEqual(message, 'Invalid displayName')
		}

	})
	it('list', async () => {
		const ids = await logGroup.list(compartmentId)
		console.debug(ids)
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

		const ocid = await log.create('log')
		console.info(ocid)
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
	const auth = new SimpleAuthentication()
	const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea'
	it('put', async () => {
		await log(auth.provider, compartmentId, 'debug', 'logContent')
	})

})
