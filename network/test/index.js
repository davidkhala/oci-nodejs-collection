const {FileAuthentication} = require('../../index')
const auth = new FileAuthentication()
const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea'
const assert = require('assert')
const LB = require('../load-balancer')

describe('load-balancer', () => {
	const lb = new LB(auth)
	it('get load-balancer', async () => {

		const lbid = 'ocid1.loadbalancer.oc1.ap-sydney-1.aaaaaaaahvnci5ytaz3mjtbhopdge2qugtnma64sdhkxetzn475homwxqabq'
		const result = await lb.get(lbid)
		console.debug(result)
	})
	it('load balancer not found', async () => {
		const lbid = 'ocid1.loadbalancer.oc1.ap-sydney-1.aaaaaaaahvnci5ytaz3mjtbhopdge2qugtnma64sdhkxetzn475homwxqaba'
		const result = await lb.get(lbid)
		console.debug(result)
	})
	it('list load-balancer', async () => {
		const lb = new LB(auth)
		const result = await lb.list(compartmentId)
		console.debug(result)
	})
})