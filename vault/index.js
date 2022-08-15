import {KmsVaultClient, KmsManagementClient, KmsCryptoClient, models} from 'oci-keymanagement';
import fs from 'fs';
import assert from 'assert';
import {DefaultSigningAlgorithm} from './convention.js';
import {execSync} from '@davidkhala/light/devOps.js';

const {SignDataDetails: {SigningAlgorithm, MessageType}, KeySummary, VaultSummary, ExportKeyDetails} = models;

/**
 * https://github.com/oracle/oci-typescript-sdk/blob/master/examples/javascript/keymanagement.js
 */
class VaultManager {
	/**
	 *
	 * @param {_Connector} connector
	 */
	constructor(connector) {
		const {provider} = connector;
		this.vault = new KmsVaultClient({authenticationDetailsProvider: provider});
	}

	/**
	 *
	 * @param {string} compartmentId
	 * @return {Promise<VaultSummary[]>}
	 */
	async list(compartmentId) {
		const request = {compartmentId};
		const {items} = await this.vault.listVaults(request);
		return items.filter(({lifecycleState}) => lifecycleState !== KeySummary.LifecycleState.Deleted);
	}

	/**
	 *
	 * @param {string} vaultId - OCID of vault
	 * @return {Promise<Vault>}
	 */
	async get(vaultId) {
		const {vault} = await this.vault.getVault({vaultId});
		return vault;
	}
}

class KeyOperator {
	/**
	 *
	 * @param {_Connector} connector
	 * @param {model.VaultSummary|model.Vault} vault
	 * @param {string} [keyId]
	 */
	constructor(connector, vault, keyId) {
		const {provider} = connector;
		const {cryptoEndpoint, managementEndpoint, compartmentId} = vault;
		const kms = new KmsManagementClient({authenticationDetailsProvider: provider});
		kms.endpoint = managementEndpoint;
		const cryptoOperator = new KmsCryptoClient({authenticationDetailsProvider: provider});
		cryptoOperator.endpoint = cryptoEndpoint;

		Object.assign(this, {kms, cryptoOperator, keyId, compartmentId});
	}

	/**
	 *
	 * @param {string} [public_RSA_wrapping_key] The content of public key (in PEM format), if not specified, it generates one by openssl
	 * @returns {Promise<void>}
	 */
	async export(public_RSA_wrapping_key) {
		const keySize = 256;

		const privateKeyPath = 'private.pem';
		const publicKeyPath = 'public.pem';
		execSync(`openssl genrsa -out ${privateKeyPath} ${8 * keySize}`);
		execSync(`openssl rsa -in ${privateKeyPath} -outform PEM -pubout -out ${publicKeyPath}`);
		public_RSA_wrapping_key = fs.readFileSync(publicKeyPath).toString();

		const {keyShape: {algorithm}} = await this.get();
		const exportKeyDetails = {
			keyId: this.keyId,
			publicKey: public_RSA_wrapping_key
		};
		if (algorithm === 'ECDSA') {
			exportKeyDetails.algorithm = ExportKeyDetails.Algorithm.RsaOaepAesSha256;
		} else {
			// TODO What is other case?
			exportKeyDetails.algorithm = ExportKeyDetails.Algorithm.RsaOaepSha256;
		}
		const {exportedKeyData} = await this.cryptoOperator.exportKey({exportKeyDetails});
		const {keyVersionId, encryptedKey} = exportedKeyData;
		const hexWrap = Buffer.from(Buffer.from(encryptedKey, 'base64').toString('hex'));
		const aeskey = hexWrap.subarray(0, keySize).toString();
		console.debug({aeskey});
		const TEMP_WRAPPED_AES_PATH = 'TEMP_WRAPPED_AES_PATH';
		const TEMP_AES_KEY_PATH = 'TEMP_AES_KEY_PATH';
		fs.writeFileSync(TEMP_WRAPPED_AES_PATH, aeskey);
		const aesEncryptedKey = hexWrap.subarray(keySize).toString();
		console.debug({aesEncryptedKey});
		const WRAPPED_SOFTWARE_KEY_PATH = 'WRAPPED_SOFTWARE_KEY_PATH';
		fs.writeFileSync(WRAPPED_SOFTWARE_KEY_PATH, aesEncryptedKey);

		//	# Unwrap the wrapped_temp_aes_key by using the private RSA wrapping key.
		execSync(`openssl pkeyutl -decrypt -inkey ${privateKeyPath} -in ${TEMP_WRAPPED_AES_PATH} -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 -pkeyopt rsa_mgf1_md:sha256 -out ${TEMP_AES_KEY_PATH}`);
		//
		const TEMP_AES_KEY_HEX = fs.readFileSync(TEMP_AES_KEY_PATH, 'hex');
		//
		// # Unwrap the wrapped software-protected key material by using the unwrapped temporary AES key. The -id-aes256-wrap-pad OpenSSL cipher value specifies the RFC-3394-compliant CKM_RSA_AES_KEY_WRAP mechanism to use for unwrapping. As required by RFC 5649, -iv specifies an "alternative initial value" that is a 32-bit message length indicator expressed in hexadecimal.
		const SOFTWARE_KEY_PATH = 'output.key';
		execSync(`openssl enc -iv A65959A6 -in ${WRAPPED_SOFTWARE_KEY_PATH} -d -id-aes256-wrap-pad -k ${TEMP_AES_KEY_PATH} -out ${SOFTWARE_KEY_PATH}`);
		// Error: Command failed: openssl pkeyutl -decrypt -inkey private.pem -in TEMP_WRAPPED_AES_PATH -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 -pkeyopt rsa_mgf1_md:sha256 -out TEMP_AES_KEY_PATH
		// Public Key operation error
	}

	/**
	 *
	 * @param [compartmentId]
	 * @returns {Promise<*>}
	 */
	async list(compartmentId = this.compartmentId) {
		const {items} = await this.kms.listKeys({compartmentId});
		return items;
	}

	/**
	 * @return {Promise<model.Key>}
	 */
	async get() {
		const {keyId} = this;
		const {key} = await this.kms.getKey({keyId});
		this._key = key;
		return key;
	}

	async publicKey() {
		const {keyId} = this;
		const {currentKeyVersion, keyShape: {algorithm}} = await this.get();
		assert.ok(algorithm === 'ECDSA' || algorithm === 'RSA');

		const {keyVersion} = await this.kms.getKeyVersion({
			keyId,
			keyVersionId: currentKeyVersion
		});
		return keyVersion.publicKey;
	}

	async encrypt(plaintext, keyVersionId) {
		const {keyId} = this;
		const encryptDataDetails = {
			keyId,
			plaintext,
			keyVersionId
		};

		return await this.cryptoOperator.encrypt({encryptDataDetails});
	}

	/**
	 *
	 * @param message
	 * @param {SigningAlgorithm} [signingAlgorithm]
	 * @param [keyVersionId]
	 * @param {boolean} [useDigest]
	 * @return {Promise<string>} base64 format signature
	 */
	async sign(message, signingAlgorithm, keyVersionId, useDigest) {
		const {keyId} = this;
		if (!signingAlgorithm) {

			const {keyShape: {algorithm}, currentKeyVersion} = await this.get();
			signingAlgorithm = DefaultSigningAlgorithm[algorithm];
			if (!keyVersionId) {
				keyVersionId = currentKeyVersion;
			}
		}
		const signDataDetails = {
			message: Buffer.from(message).toString('base64'),
			keyId,
			keyVersionId,
			signingAlgorithm
		};
		if (useDigest) {
			signDataDetails.messageType = MessageType.Digest;
		}
		const {signedData: {signature}} = await this.cryptoOperator.sign({signDataDetails});
		return signature;
	}

	/**
	 *
	 * @param signature The base64-encoded binary data object denoting the cryptographic signature generated for the message.
	 * @param message
	 * @param [signingAlgorithm]
	 * @param [keyVersionId]
	 * @param {boolean} [wasDigest]
	 * @return {Promise<boolean>}
	 */
	async verify(signature, message, signingAlgorithm, keyVersionId, wasDigest) {
		const {keyId} = this;
		if (!signingAlgorithm) {
			const {currentKeyVersion, keyShape: {algorithm}} = await this.get();
			signingAlgorithm = DefaultSigningAlgorithm[algorithm];
			if (!keyVersionId) {
				keyVersionId = currentKeyVersion;
			}
		}

		const verifyDataDetails = {
			keyId,
			keyVersionId,
			signature,
			message: Buffer.from(message).toString('base64'),
			signingAlgorithm
		};
		if (wasDigest) {
			verifyDataDetails.messageType = MessageType.Digest;
		}
		const {verifiedData} = await this.cryptoOperator.verify({verifyDataDetails});
		return verifiedData.isSignatureValid;
	}
}


export {VaultManager as Vault};
export {KeyOperator as Key};