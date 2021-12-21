import {LoggingClient} from "oci-loggingingestion";
import {AbstractService} from '@davidkhala/oci-common'

export class Logger extends AbstractService {
	constructor(connector, logId) {
		super(connector, LoggingClient);
		this.logId = logId
	}

	/**
	 * @typedef {Object} LogEntry
	 * @property {string} data
	 * @property {string} id
	 * @property {string} [time] An RFC3339-formatted date-time string with milliseconds precision.
	 *      If unspecified, defaults to `defaultlogentrytime`
	 */

	/**
	 *
	 *
	 * @param source
	 * @param type
	 * @param time
	 * @param {LogEntry[]} logEntries
	 */
	async putSingleBatch({source, type, time = new Date()}, ...logEntries) {

		const entries = logEntries.map(({data, id, time}) => ({data, id, time}))
		const putLogsDetails = {
			specversion: "1.0",
			logEntryBatches: [
				{
					entries,
					source,
					type,
					defaultlogentrytime: time
				}
			]
		};


		await this.client.putLogs({
			logId: this.logId,
			putLogsDetails,
		});

	}
}
