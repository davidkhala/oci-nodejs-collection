import {SimpleAuthenticationDetailsProvider, Region, ConfigFileAuthenticationDetailsProvider} from "oci-common";
import {IdentityClient} from "oci-identity";

class _Connector {
	constructor() {
		/**
		 *
		 * @type {AuthenticationDetailsProvider}
		 */
		this.provider = undefined
	}

	async connect() {
		const identityClient = new IdentityClient({
			authenticationDetailsProvider: this.provider
		});
		const {items} = await identityClient.listRegionSubscriptions({tenancyId: this.provider.getTenantId()});
		for (const item of items) {
			if (item.isHomeRegion) {
				identityClient.regionId = item.regionName;
			}
		}
		return identityClient
	}
}

export class SimpleAuthentication extends _Connector {
	constructor({tenancy, user, fingerprint, privateKey, regionId}) {
		super()
		this.provider = new SimpleAuthenticationDetailsProvider(tenancy, user, fingerprint, privateKey, null, Region.fromRegionId(regionId));
	}
}

export class FileAuthentication extends _Connector {
	constructor() {
		super()
		this.provider = new ConfigFileAuthenticationDetailsProvider()
	}

}

export class AbstractService {
	/**
	 *
	 * @param {_Connector} connector
	 * @param {function} ClientCLass
	 */
	constructor(connector, ClientCLass) {
		const {provider} = connector
		this.client = new ClientCLass({authenticationDetailsProvider: provider})

	}

	/**
	 *
	 * @param {function} WaiterClass
	 */
	withWaiter(WaiterClass) {
		this.waiter = new WaiterClass(this.client)
	}
}
