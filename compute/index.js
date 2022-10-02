import {ComputeClient} from 'oci-core';
import {AbstractService} from '@davidkhala/oci-common';

export class Instance extends AbstractService {
	constructor(connect) {
		super(connect, ComputeClient);
	}

	async inspect(instanceId) {
		const {instance} = await this.client.getInstance({instanceId});
		return instance;
	}
}
