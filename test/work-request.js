const WorkRequest = require('../work-request')
const {FileAuthentication} = require('../index')
const auth = new FileAuthentication()
const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea'
describe('work-request', () => {
	const workRequest = new WorkRequest(auth)
	it('get by compartment', async () => {

		const result = await workRequest.of(compartmentId)
		console.debug(result)
	})
	it('get by compartment and ocid', async ()=>{
		const ocid = 'ocid1.waaspolicy.oc1..aaaaaaaaffl3vz2j3hwyoauvzkb75rpid3vx4uxyeznqz6oca3pgr7daieha'
		// Note WAF resource work-request cannot be found here
		const result = await workRequest.of(compartmentId, ocid)
		console.debug(result)
	})

})