import {BigData} from '../../big-data/index.js';

// TODO make this as separate module

export async function exposeBDSNode(bds, privateIp, publicIP, name, suffix) {

	const hiveServer = BigData.nodeNameOf(name, suffix);
	const one = await bds.list({name});
	const details = await bds.inspect(one.id);

	const nodeIPs = BigData.nodeIPsOf(details);
	const found = nodeIPs.find(({displayName}) => {
		return displayName === hiveServer;
	});
	if (!found) {
		return;
	}
	const {id: privateIpId} = await privateIp.find(found);
	const {id: publicIpId} = await publicIP.create(undefined, {name: hiveServer});
	const result = await publicIP.associate(publicIpId, {privateIpId});
	return result.id;
}


