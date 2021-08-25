const {LoadBalancerClient} = require('oci-loadbalancer')
const {NetworkLoadBalancerClient} = require('oci-networkloadbalancer')

class LoadBalancer {
	/**
	 *
	 * @param {_Connector} connector
	 */
	constructor(connector) {
		const {provider} = connector
		this.nlb = new NetworkLoadBalancerClient({authenticationDetailsProvider: provider})
		this.lb = new LoadBalancerClient({authenticationDetailsProvider: provider})
	}

	async get(loadBalancerId, type = 'LoadBalancer') {
		switch (type) {
			case "LoadBalancer":
				const {loadBalancer} = await this.lb.getLoadBalancer({loadBalancerId})
				return loadBalancer

			case "NetworkLoadBalancer":
				const {networkLoadBalancer} = await this.nlb.getNetworkLoadBalancer({networkLoadBalancerId: loadBalancerId})
				return networkLoadBalancer

			default:
				try {
					return await this.get(loadBalancerId)
				} catch (e) {
					if (e.serviceCode === 'NotAuthorizedOrNotFound') {
						return await this.get(loadBalancerId, "NetworkLoadBalancer")
					} else {
						throw e
					}
				}

		}

	}

	async list(compartmentId) {
		const {items} = await this.lb.listLoadBalancers({compartmentId, detail: 'simple'})
		return items;
	}
}

module.exports = LoadBalancer