import {
	SimpleAuthenticationDetailsProvider,
	Region,
	ConfigFileAuthenticationDetailsProvider,
	ResourcePrincipalAuthenticationDetailsProvider
} from 'oci-common';
import {IdentityClient} from 'oci-identity';
import assert from 'assert';

class _Connector {
	/**
	 * @param {string} [compartmentId]
	 */
	constructor(compartmentId) {
		this.compartmentId = compartmentId;
		/**
		 *
		 * @type {AuthenticationDetailsProvider}
		 */
		this.provider = undefined;
	}

	async connect() {
		const identityClient = new IdentityClient({
			authenticationDetailsProvider: this.provider
		});
		await identityClient.listAllCompartments({});

		return identityClient;
	}
}

export class SimpleAuthentication extends _Connector {
	/**
	 *
	 * @param [tenancy]
	 * @param [user]
	 * @param [fingerprint]
	 * @param {string} [privateKey] pem format string
	 * @param {string} [regionId]
	 * @param [compartmentId]
	 */
	constructor({tenancy, user, fingerprint, privateKey, regionId, compartmentId} = process.env) {
		super(compartmentId);
		if (privateKey && fingerprint) {
			this.provider = new SimpleAuthenticationDetailsProvider(tenancy, user, fingerprint, privateKey, null, Region.fromRegionId(regionId));

		} else {
			try {
				const fileAuthN = new FileAuthentication();
				assert.ok(fileAuthN.validate());
				this.provider = fileAuthN.provider;
			} catch (e) {
				this.provider = new DynamicGroupAuthentication();
			}

		}
	}
}

export class FileAuthentication extends _Connector {
	constructor(compartmentId) {
		super(compartmentId);
		this.provider = new ConfigFileAuthenticationDetailsProvider();
	}

	validate() {
		const {provider} = this;
		return provider.getPrivateKey() && provider.getFingerprint() && provider.getTenantId() && provider.getUser();
	}

	async connect() {
		if (this.validate()) {
			return super.connect();
		}
	}

}

export class DynamicGroupAuthentication extends _Connector {
	constructor(compartmentId) {
		super(compartmentId);
		this.provider = new ResourcePrincipalAuthenticationDetailsProvider();
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
			this.client = client;
		} else {
			const {provider, compartmentId} = connector;
			this.compartmentId = compartmentId;
			this.client = new ClientCLass({authenticationDetailsProvider: provider});
		}

	}

	/**
	 *
	 * @param {function} [WaiterClass]
	 */
	withWaiter(WaiterClass) {
		if (WaiterClass) {
			this.waiter = new WaiterClass(this.client);
		} else {
			this.waiter = this.client.getWaiters();
		}
	}

	async wait({opcWorkRequestId}, expectedOperationType) {
		if (!this.waiter) {
			return;
		}
		const {workRequest} = await this.waiter.forWorkRequest({workRequestId: opcWorkRequestId});
		const {operationType, status, resources} = workRequest;
		if (expectedOperationType) {
			assert.strictEqual(operationType, expectedOperationType);
		}
		assert.strictEqual(status, 'SUCCEEDED');
		return resources.map(({identifier}) => identifier);
	}
}
