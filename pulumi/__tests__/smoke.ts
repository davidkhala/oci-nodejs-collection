import {Tenancy} from '@davidkhala/pulumi-oci';

describe('san check ', () => {
	it('compartment', async () => {
		new Tenancy('name');
		// FIXME error here
	});
});