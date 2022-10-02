import {PrivateIP, PublicIP} from '../VCN.js';
import {SimpleAuthentication} from '@davidkhala/oci-common';

describe('public ip', function () {
	this.timeout(0);
	const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea';
	const connect = new SimpleAuthentication({compartmentId});
	const publicIP = new PublicIP(connect);

	it('list', async () => {
		const list = await publicIP.list();
		console.info(list);
	});

	it('create', async () => {
		const result = await publicIP.create(undefined, {name: 'name'});
		console.debug(result);
	});
});
describe('private ip', function () {
	this.timeout(0);
	const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea';
	const connect = new SimpleAuthentication({compartmentId});
	const privateIP = new PrivateIP(connect);
	it('list', async () => {
		const list = await privateIP.list();
		console.debug(list);
	});
});
