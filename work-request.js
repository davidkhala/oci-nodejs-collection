const {WorkRequestClient, waitForWorkRequest} = require('oci-workrequests')

class WorkRequest {
	/**
	 *
	 * @param {_Connector} connector
	 */
	constructor(connector) {
		const {provider} = connector
		this.client = new WorkRequestClient({authenticationDetailsProvider: provider})
	}

	async of(compartmentId, resourceId) {
		const {items} = await this.client.listWorkRequests({compartmentId, resourceId})
		return items
	}
}

module.exports = WorkRequest