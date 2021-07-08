const model = require('oci-keymanagement/lib/model')
const {SignDataDetails: {SigningAlgorithm: {EcdsaSha256}}} = model

const {KmsVaultClient, KmsManagementClient, KmsCryptoClient} = require('oci-keymanagement/lib/client')

/**
 * https://github.com/oracle/oci-typescript-sdk/blob/master/examples/javascript/keymanagement.js
 */
class VaultManager {
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
     * @return {Promise<model.VaultSummary[]>}
     */
    async list(compartmentId) {
        const request = {compartmentId}
        const {items} = await this.vault.listVaults(request)
        return items.filter(({lifecycleState}) => lifecycleState !== KeySummary.LifecycleState.Deleted)
    }

    /**
     *
     * @param {string} vaultId - OCID of vault
     * @return {Promise<model.Vault>}
     */
    async get(vaultId) {
        const {vault} = await this.vault.getVault({vaultId})
        return vault
    }
}

class KeyOperator {
    /**
     *
     * @param {_Connector} connector
     * @param {model.VaultSummary|model.Vault} vault
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
     * @return {Promise<model.Key>}
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

    /**
     *
     * @param keyId
     * @param message
     * @param {SigningAlgorithm} signingAlgorithm default to ECDSA_SHA_256
     * @param [keyVersionId]
     * @return {Promise<model.SignedData>}
     */
    async sign(keyId, message, signingAlgorithm , keyVersionId) {

        const signDataDetails = {
            message: Buffer.from(message).toString('base64'),
            keyId,
            keyVersionId,
            signingAlgorithm
        }

        const {signedData:{signature}} =  await this.cryptoOperator.sign({signDataDetails})
        return signature
    }
}

module.exports = {
    Vault: VaultManager,
    Key: KeyOperator,
}


