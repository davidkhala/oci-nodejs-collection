export function slimOf(result) {
	delete result.compartmentId;
	delete result.definedTags;
	delete result.freeformTags;
	delete result.timeCreated;
	return result;
}
