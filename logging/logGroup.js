import {LoggingManagementClient, LoggingManagementWaiter, models} from "oci-logging"
import {AbstractService} from "@davidkhala/oci-common"


export class LogGroup extends AbstractService {

	constructor(connector) {
		super(connector, LoggingManagementClient);
		this.withWaiter(LoggingManagementWaiter)
	}

	/**
	 *
	 * @param {string} compartmentId
	 * @param {string} displayName
	 * @param {string} [description] cannot be an empty string
	 */
	async create(compartmentId, displayName, description) {
		const createLogGroupDetails = {
			compartmentId, displayName, description
		}

		const {opcWorkRequestId} = await this.client.createLogGroup({createLogGroupDetails})
		const ocids = await this.wait({opcWorkRequestId}, 'CREATE_LOG_GROUP')
		return ocids[0]
	}

	async delete(logGroupId) {
		const {opcWorkRequestId} = await this.client.deleteLogGroup({logGroupId})
		return await this.wait({opcWorkRequestId}, 'DELETE_LOG_GROUP')

	}

	async clear(compartmentId) {
		const items = await this.list(compartmentId)
		for (const id of items.map(({id}) => id)) {
			// TODO clear recursive
			await this.delete(id)
		}

	}

	/**
	 *
	 * @param {string} compartmentId
	 * @param {string} [exactName]
	 */
	async list(compartmentId, exactName) {
		const request = {
			compartmentId
		}
		if (exactName) {
			request.displayName = exactName
		}

		const {items} = await this.client.listLogGroups(request)

		return items
	}


}

export class Log extends AbstractService {
	constructor(connector, logGroupId) {
		super(connector, LoggingManagementClient);
		this.logGroupId = logGroupId
		this.withWaiter(LoggingManagementWaiter)
	}

	async create(name) {
		const createLogRequest = {
			logGroupId: this.logGroupId,
			createLogDetails: {
				displayName: name,
				logType: models.Log.LogType.Custom,

				isEnabled: true,
			}
		}


		const response = await this.client.createLog(createLogRequest)
		const ocids = await this.wait(response)
		return ocids[0]

	}

	async list() {
		const {logGroupId} = this
		const {items} = await this.client.listLogs({logGroupId})
		return items
	}

	async clear() {
		const items = await this.list()
		for (const id of items.map(({id}) => id)) {
			await this.delete(id)
		}
	}

	async delete(logId) {
		const {logGroupId} = this
		const response = await this.client.deleteLog({logGroupId, logId})
		await this.wait(response)
	}
}


