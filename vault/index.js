const {KmsVaultClient, KmsManagementClient, models: {VaultSummary, KeySummary}} = require('oci-keymanagement')

/**
 * https://github.com/oracle/oci-typescript-sdk/blob/master/examples/javascript/keymanagement.js
 */
class Vault {
    /**
     *
     * @param {_Connector} connector
     */
    constructor(connector) {
        const {provider} = connector
        this.vault = new KmsVaultClient({authenticationDetailsProvider: provider})
    }

    /**
     *
     * @param {string} compartmentId
     * @return {Promise<VaultSummary[]>}
     */
    async list(compartmentId) {
        const request = {compartmentId}
        const {items} = await this.vault.listVaults(request)
        return items.filter(({lifecycleState}) => lifecycleState !== KeySummary.LifecycleState.Deleted)
    }
}

class Key {
    constructor() {
        // TODO WIP
    }
}

module.exports = {
    Vault,
    Key,
}


