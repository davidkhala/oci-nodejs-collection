import {LogGroup} from './logGroup.js'
import {Logger} from './logger.js'
export async function log(provider,compartment, level,...tokens ) {
	const logGroup = new LogGroup({provider})
	const [logGroupName, ] = tokens
	await logGroup.create(compartment,logGroupName )
	// TODO WIP
}