import {Instance} from '../index.js';
import {SimpleAuthentication} from '@davidkhala/oci-common';

describe('instance', function () {
	this.timeout(0);
	const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea';
	const connect = new SimpleAuthentication(compartmentId);
	const instance = new Instance(connect);
	it('get', async () => {
		const id = 'ocid1.instance.oc1.ap-singapore-1.anzwsljrjtu3p6ycvcds5t5oja6hx4aoptmtemgoqz4yx43b3zbwy52l2jpa';
		const detail = await instance.inspect(id);
		console.info(detail);
	});
});
