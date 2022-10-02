import {BigData} from '../big-data/index.js';
import {SimpleAuthentication} from '@davidkhala/oci-common';
import {PrivateIP, PublicIP} from '../compute/VCN.js';

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
		const hiveServer = BigData.nodeNameOf(name, hiveServerSuffix);
		const one = await bds.list({name});
		const details = await bds.inspect(one.id);

		const nodeIPs = BigData.nodeIPsOf(details);
		const found = nodeIPs.find(({displayName}) => {
			return displayName === hiveServer;
		});
		console.debug(found);
		const {id: privateIpId} = await privateIp.find(found);
		const {id: publicIpId} = await publicIP.create(undefined, {name: hiveServer});
		const result = await publicIP.associate(publicIpId, {privateIpId});
		console.info(result);
		//	cleanup
		await publicIP.delete(publicIpId);

	});
});
