import {KmsVaultClient, KmsManagementClient, KmsCryptoClient, models} from 'oci-keymanagement'
import {DefaultSigningAlgorithm} from './convention.js'
import assert from "assert";

const {SignDataDetails: {SigningAlgorithm}, KeySummary, VaultSummary} = models

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
     * @return {Promise<VaultSummary[]>}
     */
    async list(compartmentId) {
        const request = {compartmentId}
        const {items} = await this.vault.listVaults(request)
        return items.filter(({lifecycleState}) => lifecycleState !== KeySummary.LifecycleState.Deleted)
    }

    /**
     *
     * @param {string} vaultId - OCID of vault
     * @return {Promise<Vault>}
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

    async publicKeyOf(keyId) {
        const {currentKeyVersion, keyShape: {algorithm}} = await this.get(keyId)
        assert.ok(algorithm === 'ECDSA' || algorithm === 'RSA')

        const {keyVersion} = await this.kms.getKeyVersion({
            keyId,
            keyVersionId: currentKeyVersion
        })
        return keyVersion.publicKey
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
     * @param {SigningAlgorithm} [signingAlgorithm]
     * @param [keyVersionId]
     * @return {Promise<string>}
     */
    async sign(keyId, message, signingAlgorithm, keyVersionId) {

        if (!signingAlgorithm) {

            const {keyShape: {algorithm}, currentKeyVersion} = await this.get(keyId)
            signingAlgorithm = DefaultSigningAlgorithm[algorithm]
            if (!keyVersionId) {
                keyVersionId = currentKeyVersion
            }
        }
        const signDataDetails = {
            message: Buffer.from(message).toString('base64'),
            keyId,
            keyVersionId,
            signingAlgorithm
        }
        const {signedData: {signature}} = await this.cryptoOperator.sign({signDataDetails})
        return signature
    }

    /**
     *
     * @param keyId
     * @param signature The base64-encoded binary data object denoting the cryptographic signature generated for the message.
     * @param message
     * @param [signingAlgorithm]
     * @param [keyVersionId]
     * @return {Promise<boolean>}
     */
    async verify(keyId, signature, message, signingAlgorithm, keyVersionId) {

        if (!signingAlgorithm) {
            const {currentKeyVersion, keyShape: {algorithm}} = await this.get(keyId)
            signingAlgorithm = DefaultSigningAlgorithm[algorithm]
            if (!keyVersionId) {
                keyVersionId = currentKeyVersion
            }
        }

        const verifyDataDetails = {
            keyId,
            keyVersionId,
            signature,
            message: Buffer.from(message).toString('base64'),
            signingAlgorithm
        }
        const {verifiedData} = await this.cryptoOperator.verify({verifyDataDetails})
        return verifiedData.isSignatureValid
    }
}


export {VaultManager as Vault}
export {KeyOperator as Key}