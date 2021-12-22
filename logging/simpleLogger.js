import {LogGroup, Log} from './logGroup.js'
import {Logger} from './logger.js'

export async function log(provider, compartmentId, level, ...tokens) {
	const logGroup = new LogGroup({provider})

	const [data, id = Date.now(), source = 'localhost', logName = 'nodejs', logGroupName = 'instance-origin',] = tokens
	const logGroupID = await logGroup.create(compartmentId, logGroupName)
	const log = new Log({provider}, logGroupID)
	const logId = await log.create(logName)
	const logger = new Logger({provider}, logId)

	await logger.putSingleBatch({source, type: level}, {id, data})
}