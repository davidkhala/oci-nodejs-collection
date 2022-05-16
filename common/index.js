import {
	SimpleAuthenticationDetailsProvider,
	Region,
	ConfigFileAuthenticationDetailsProvider,
	ResourcePrincipalAuthenticationDetailsProvider
} from "oci-common";
import {IdentityClient} from "oci-identity";
import assert from "assert";

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

		await identityClient.listRegions({})

		return identityClient
	}
}

export class SimpleAuthentication extends _Connector {
	/**
	 *
	 * @param tenancy
	 * @param user
	 * @param fingerprint
	 * @param {string} privateKey pem format string
	 * @param {string} regionId
	 */
	constructor({tenancy, user, fingerprint, privateKey, regionId} = process.env) {
		super()
		if (privateKey && fingerprint) {
			this.provider = new SimpleAuthenticationDetailsProvider(tenancy, user, fingerprint, privateKey, null, Region.fromRegionId(regionId));

		} else {
			try {
				const fileAuthN = new FileAuthentication()
				assert.ok(fileAuthN.validate())
				this.provider = fileAuthN.provider
			} catch (e) {
				this.provider = new IAMAuthentication()
			}

		}
	}
}

export class FileAuthentication extends _Connector {
	constructor() {
		super()
		this.provider = new ConfigFileAuthenticationDetailsProvider()
	}

	validate() {
		const {provider} = this
		return provider.getPrivateKey() && provider.getFingerprint() && provider.getTenantId() && provider.getUser()
	}

	async connect() {
		if (this.validate()) {
			return super.connect();
		}
	}

}

export class IAMAuthentication extends _Connector {
	constructor() {
		super();
		this.provider = new ResourcePrincipalAuthenticationDetailsProvider()
	}
}

export class AbstractService {
	/**
	 *
	 * @param {_Connector} connector
	 * @param {function} ClientCLass
	 * @param [client]
	 */
	constructor(connector, ClientCLass, client) {
		if (client) {
			this.client = client
		} else {
			const {provider} = connector
			this.client = new ClientCLass({authenticationDetailsProvider: provider})
		}

	}

	/**
	 *
	 * @param {function} WaiterClass
	 */
	withWaiter(WaiterClass) {
		this.waiter = new WaiterClass(this.client)
	}

	async wait({opcWorkRequestId}, expectedOperationType) {
		if (!this.waiter) {
			return
		}
		const {workRequest} = await this.waiter.forWorkRequest({workRequestId: opcWorkRequestId})
		const {operationType, status, resources} = workRequest
		if (expectedOperationType) {
			assert.strictEqual(operationType, expectedOperationType)
		}
		assert.strictEqual(status, 'SUCCEEDED')
		return resources.map(({identifier}) => identifier)
	}
}
