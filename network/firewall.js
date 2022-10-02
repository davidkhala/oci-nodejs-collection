import {WaasClient, WaasWaiter} from 'oci-waas';
import {AbstractService} from '@davidkhala/oci-common';

export default class FireWall extends AbstractService {
	/**
	 *
	 * @param {_Connector} connector
	 */
	constructor(connector) {
		super(connector, WaasClient);
		this.withWaiter(WaasWaiter);
	}

	/**
	 *
	 * @param compartmentId
	 * @param [displayName]
	 * @param domains
	 * @param {Object|string[]|string} origins
	 * @param [policyConfig]
	 */
	async create({compartmentId, displayName, domains, origins: rawOrigins, policyConfig}) {
		const [domain, ...additionalDomains] = domains;

		if (domain && domain.includes('*')) {
			throw Error(`Domain URL '${domain}' is not valid`);
		}
		if (additionalDomains.length === 0) {
			additionalDomains.push(`*.${domain}`);
		}
		const originGroups = {};
		const origins = {};
		const wafConfig = {};
		const defaultOriginGroup = 'Default Group';
		if (Array.isArray(rawOrigins)) {
			Object.assign(origins, rawOrigins.reduce((previousValue, currentValue) => {
				previousValue[currentValue] = {uri: currentValue};
				return previousValue;
			}, {}));
			originGroups[defaultOriginGroup] = {
				origins: rawOrigins.map((origin) => ({origin, weight: 1}))
			};
			Object.assign(wafConfig, {origin: rawOrigins[0], originGroups: [defaultOriginGroup]});
		} else if (typeof rawOrigins === 'string') {
			origins[rawOrigins] = {uri: rawOrigins};
			originGroups[defaultOriginGroup] = {
				origins: [{origin: rawOrigins, weight: 1}]
			};
			wafConfig.origin = rawOrigins;
			wafConfig.originGroups = [defaultOriginGroup];
		} else {
			// TODO case: rawOrigins is an Object
		}
		const createWaasPolicyDetails = {
			compartmentId, displayName,
			domain, additionalDomains,
			origins, originGroups,
			policyConfig, wafConfig
		};
		const {opcWorkRequestId} = await this.waf.createWaasPolicy({createWaasPolicyDetails});
		const {
			workRequest: {
				resources
			}
		} = await this.waiter.forWorkRequest({workRequestId: opcWorkRequestId});

		return resources[0].identifier;

	}

	async delete(waasPolicyId) {
		const {opcWorkRequestId} = await this.waf.deleteWaasPolicy({waasPolicyId});
		const {
			workRequest: {
				resources
			}
		} = await this.waiter.forWorkRequest({workRequestId: opcWorkRequestId});
		return resources[0].identifier;
	}

	async get(waasPolicyId) {
		const {waasPolicy} = await this.client.getWaasPolicy({waasPolicyId});
		return waasPolicy;
	}

	// TODO
	async update(waasPolicyId, {displayName, domains}) {
		if (displayName || domains) {
			const updateWaasPolicyDetails = {displayName, additionalDomains};
			// "displayName"?: string;
			//     /**
			//      * An array of additional domains protected by this WAAS policy.
			//      */
			//     "additionalDomains"?: Array<string>;
			//     /**
			//      * A map of host to origin for the web application. The key should be a customer friendly name for the host, ex. primary, secondary, etc.
			//      */
			//     "origins"?: {
			//         [key: string]: model.Origin;
			//     };
			//     /**
			//      * The map of origin groups and their keys used to associate origins to the `wafConfig`. Origin groups allow you to apply weights to groups of origins for load balancing purposes. Origins with higher weights will receive larger proportions of client requests.
			//      * To add additional origins to your WAAS policy, update the `origins` field of a `UpdateWaasPolicy` request.
			//      */
			//     "originGroups"?: {
			//         [key: string]: model.OriginGroup;
			//     };
			//     "policyConfig"?: model.PolicyConfig;
			//     "wafConfig"?: model.WafConfig;
			//     /**
			//       * Free-form tags for this resource. Each tag is a simple key-value pair with no predefined name, type, or namespace.
			//   * For more information, see [Resource Tags](https://docs.cloud.oracle.com/Content/General/Concepts/resourcetags.htm).
			//   * <p>
			//   Example: `{\"Department\": \"Finance\"}`
			//   *
			//       */
			//     "freeformTags"?: {
			//         [key: string]: string;
			//     };
			//     /**
			//       * Defined tags for this resource. Each key is predefined and scoped to a namespace.
			//   * For more information, see [Resource Tags](https://docs.cloud.oracle.com/Content/General/Concepts/resourcetags.htm).
			//   * <p>
			//   Example: `{\"Operations\": {\"CostCenter\": \"42\"}}`
			//   *
			//       */
			//     "definedTags"?: {
			//         [key: string]: {
			//             [key: string]: any;
			//         };
			//     };
			await this.client.updateWaasPolicy({waasPolicyId, updateWaasPolicyDetails});
		} else {

		}

	}
}
