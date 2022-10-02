import {VirtualNetworkClient} from 'oci-core';
import assert from 'assert';
import {AbstractService} from '@davidkhala/oci-common';
import {slimOf} from '@davidkhala/oci-common/format.js'
import {CreatePublicIpDetails} from 'oci-core/lib/model/create-public-ip-details.js';
import {ListPublicIpsRequest} from 'oci-core/lib/request/index.js';

const {Lifetime: {Reserved, Ephemeral}} = CreatePublicIpDetails;
const {Scope} = ListPublicIpsRequest;

class AbstractVCN extends AbstractService {
	constructor(connector) {
		super(connector, VirtualNetworkClient);
	}
}

export class PublicIP extends AbstractVCN {

	async create(privateIpId, {name, lifetime} = {}) {
		const {publicIp} = await this.client.createPublicIp({
			createPublicIpDetails: {
				compartmentId: this.compartmentId,
				displayName: name,
				lifetime: lifetime || privateIpId ? Ephemeral : Reserved,
			}
		});

		return slimOf(publicIp);

	}

	async list() {
		const {items} = await this.client.listPublicIps({
			scope: Scope.Region,
			compartmentId: this.compartmentId
		});
		return items;
	}

	async associate(publicIpId, {privateIpId, updatedName} = {}) {
		const {publicIp} = await this.client.updatePublicIp({
			publicIpId,
			updatePublicIpDetails: {
				displayName: updatedName,
				privateIpId,
			}
		});
		return publicIp;
	}
}

export class PrivateIP extends AbstractVCN {
	async list({ipAddress, subnetId, vnicId} = {}) {
		const {items} = await this.client.listPrivateIps({ipAddress, subnetId, vnicId});
		return items;
	}

	async find({ipAddress, subnetId, vnicId}) {
		const items = await this.list({ipAddress, subnetId, vnicId});
		assert.strictEqual(items.length, 1);
		const [item] = items;

		return slimOf(item);
	}
}
