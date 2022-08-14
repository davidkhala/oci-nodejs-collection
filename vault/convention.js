import crypto from 'crypto';

export const DefaultSigningAlgorithm = {
	ECDSA: 'ECDSA_SHA_256',
	RSA: 'SHA_256_RSA_PKCS1_V1_5',
};

export const sha2_256 = (data) => crypto.createHash('sha256').update(data).digest();

