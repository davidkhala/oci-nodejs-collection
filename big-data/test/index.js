import {BigData} from '../index.js';
import {SimpleAuthentication} from '@davidkhala/oci-common';

describe('BigData', function () {
	this.timeout(0);
	const auth = new SimpleAuthentication();
	const bds = new BigData(auth);
	const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea';

	before(async () => {
		await auth.connect();
	});
	it('list', async () => {

		const list = await bds.list(compartmentId);
		console.debug(list);
	});
	it('list:one', async () => {
		const name = 'analytic';
		const one = await bds.list(compartmentId, {name});
		console.debug(one.id);
		const details = await bds.inspect(one.id);

		const nodeIPs = BigData.nodeIPsOf(details);
		console.debug(nodeIPs);
	});
});
