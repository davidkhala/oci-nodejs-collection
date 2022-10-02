import {LoggingManagementClient, LoggingManagementWaiter, models} from 'oci-logging';
import {AbstractService} from '@davidkhala/oci-common';


export class LogGroup extends AbstractService {

	constructor(connector) {
		super(connector, LoggingManagementClient);
		this.connector = connector;
		this.withWaiter(LoggingManagementWaiter);
	}

	/**
	 * Create if not exist
	 * @param {string} compartmentId
	 * @param {string} displayName
	 * @param {string} [description] cannot be an empty string
	 * @param {boolean} [lazy]
	 */
	async create(compartmentId, displayName, description, lazy) {
		const createLogGroupDetails = {
			compartmentId, displayName, description
		};

		const _create = async () => {
			const {opcWorkRequestId} = await this.client.createLogGroup({createLogGroupDetails});
			const ocids = await this.wait({opcWorkRequestId}, 'CREATE_LOG_GROUP');
			return ocids[0];
		};

		if (lazy) {
			try {
				return await _create();
			} catch (e) {
				const {statusCode, serviceCode, message} = e;
				if (statusCode === 409 && serviceCode === 'Conflict' && message === 'DuplicateKeyException. Log Group already exists') {
					const ids = await this.list(compartmentId, displayName);
					return ids[0];
				}
				throw e;
			}
		} else {
			const ids = await this.list(compartmentId, displayName);
			if (ids[0]) {
				return ids[0];
			}

			return await _create();
		}


	}

	async delete(logGroupId) {
		const log = new Log(this.connector, logGroupId);
		const logList = await log.list();
		for (const logId of logList) {
			await log.delete(logId);
		}
		const {opcWorkRequestId} = await this.client.deleteLogGroup({logGroupId});
		return await this.wait({opcWorkRequestId}, 'DELETE_LOG_GROUP');

	}

	async clear(compartmentId) {
		const ids = await this.list(compartmentId);
		for (const id of ids) {
			await this.delete(id);
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
		};
		if (exactName) {
			request.displayName = exactName;
		}

		const {items} = await this.client.listLogGroups(request);

		return items.map(({id}) => id);
	}


}

export class Log extends AbstractService {
	constructor(connector, logGroupId) {
		super(connector, LoggingManagementClient);
		this.logGroupId = logGroupId;
		this.withWaiter(LoggingManagementWaiter);
	}

	/**
	 *
	 * @param {string} name
	 * @param [lazy]
	 */
	async create(name, lazy) {
		const createLogRequest = {
			logGroupId: this.logGroupId,
			createLogDetails: {
				displayName: name,
				logType: models.Log.LogType.Custom,

				isEnabled: true,
			}
		};

		const _create = async () => {
			const response = await this.client.createLog(createLogRequest);
			const ocids = await this.wait(response);
			return ocids[0];
		};

		if (lazy) {
			try {
				return await _create();
			} catch (e) {
				const {statusCode, serviceCode, message} = e;
				if (serviceCode === 'Conflict' && statusCode === 409) {
					const ids = await this.list(name);
					return ids[0];
				}
			}

		} else {
			const ids = await this.list(name);
			if (ids[0]) {
				return ids[0];
			}
			return await _create();
		}

	}

	async list(name) {
		const {logGroupId} = this;
		const {items} = await this.client.listLogs({logGroupId, displayName: name});
		return items.map(({id}) => id);
	}

	async clear() {
		const items = await this.list();
		for (const id of items.map(({id}) => id)) {
			await this.delete(id);
		}
	}

	async delete(logId) {
		const {logGroupId} = this;
		const response = await this.client.deleteLog({logGroupId, logId});
		await this.wait(response);
	}
}
