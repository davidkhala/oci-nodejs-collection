import {BigData} from '../big-data/index.js';
import {SimpleAuthentication} from '@davidkhala/oci-common';
import {PrivateIP, PublicIP} from '../compute/VCN.js';
import {exposeBDSNode} from './recipe/big-data.js';

describe('BDS', function () {
	this.timeout(0);
	const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea';
	const auth = new SimpleAuthentication({compartmentId});
	const bds = new BigData(auth);
	const privateIp = new PrivateIP(auth);
	const publicIP = new PublicIP(auth);

	before(async () => {
		await auth.connect();
	});

	it('expose hive server', async () => {
		const name = 'analytic';
		const hiveServerSuffix = 'un0';
		const publicIpId = await exposeBDSNode(bds, privateIp, publicIP, name, hiveServerSuffix);
		//	cleanup
		await publicIP.delete(publicIpId);

	});
	it('expose master node', async () => {
		const name = 'analytic';
		const masterNodeSuffix = 'mn0';

		const publicIpId = await exposeBDSNode(bds, privateIp, publicIP, name, masterNodeSuffix);
		//	cleanup
		await publicIP.delete(publicIpId);
	});


});
