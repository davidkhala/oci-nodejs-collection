import {BdsClient, BdsWaiter} from 'oci-bds';
import {AbstractService} from '@davidkhala/oci-common';

export class BigData extends AbstractService {
	constructor(connect) {
		super(connect, BdsClient);
		this.withWaiter(BdsWaiter);
	}

	async list({state, name} = {}) {
		const {items} = await this.client.listBdsInstances({
			compartmentId: this.compartmentId,
			lifecycleState: state,
			displayName: name,
		});
		const trimmed = items.map(({
			id, displayName, lifecycleState, numberOfNodes,
			isHighAvailability, isSecure, isCloudSqlConfigured,
			timeCreated,
		}) => ({
			id, displayName, lifecycleState, numberOfNodes,
			isHighAvailability, isSecure, isCloudSqlConfigured,
			timeCreated,

		}));
		if (name && trimmed.length === 1) {
			return trimmed[0];
		}
		return trimmed;
	}

	async inspect(id) {
		const {bdsInstance} = await this.client.getBdsInstance({bdsInstanceId: id});
		return bdsInstance;
	}

	static nodeNameOf(bdsName, suffix) {
		return bdsName.replaceAll('-', '').slice(0, 7) + suffix;
	}

	static nodeIPsOf(bdsInstance) {
		const {nodes} = bdsInstance;

		// BDS instanceId are managed internally, could not be found via general API
		return nodes.map(({displayName, subnetId, ipAddress, hostname}) => ({
			subnetId, ipAddress, hostname, displayName
		}));
	}
}
