const {models} = require('oci-keymanagement')

const {KmsVaultClient, KmsManagementClient, KmsCryptoClient} = require('oci-keymanagement/lib/client')

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
     * @return {Promise<models.VaultSummary[]>}
     */
    async list(compartmentId) {
        const request = {compartmentId}
        const {items} = await this.vault.listVaults(request)
        return items.filter(({lifecycleState}) => lifecycleState !== KeySummary.LifecycleState.Deleted)
    }

    /**
     *
     * @param {string} vaultId - OCID of vault
     * @return {Promise<models.Vault>}
     */
    async get(vaultId) {
        const {vault} = await this.vault.getVault({vaultId})
        return vault
    }
}

class Key {
    /**
     *
     * @param {_Connector} connector
     * @param {models.VaultSummary|models.Vault} vault
     */
    constructor(connector, vault) {
        const {provider} = connector
        const {cryptoEndpoint, managementEndpoint} = vault
        const kms = new KmsManagementClient({authenticationDetailsProvider: provider})
        kms.endpoint = managementEndpoint
        const cryptoOperator = new KmsCryptoClient({authenticationDetailsProvider: provider})
        cryptoOperator.endpoint = cryptoEndpoint

        Object.assign(this, {kms, cryptoOperator})
    }

    async list(compartmentId) {
        const {items} = await this.kms.listKeys({compartmentId})
        return items
    }

    /**
     * @param keyId OCID of key
     * @return {Promise<models.Key>}
     */
    async get(keyId) {
        const {key} = await this.kms.getKey({keyId})
        return key
    }

    async encrypt(keyId, plaintext, keyVersionId) {
        const encryptDataDetails = {
            keyId,
            plaintext,
            keyVersionId
        }

        return await this.cryptoOperator.encrypt({encryptDataDetails})
    }

    async sign(keyId, message) {
        const signDataDetails = {
            message,
            keyId,
        }
        // FIXME: Error: Internal Server Error
        return await this.cryptoOperator.sign({signDataDetails})
    }
}

module.exports = {
    Vault,
    Key,
}


