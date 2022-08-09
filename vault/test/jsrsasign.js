import {Key, Vault} from "../index.js";
import {FileAuthentication} from '../../common/index.js'
import {CSR} from '@davidkhala/crypto/pkcs10.js'
import assert from "assert";
import {ECDSAKey} from "@davidkhala/crypto/ECDSA.js";
import X500Name from "@davidkhala/crypto/X500Name.js";
import {Extension} from "@davidkhala/crypto/extension.js";
import fs from 'fs'
import path from 'path'

const auth = new FileAuthentication()
describe('csr', function () {
    this.timeout(0)

    let oneVault
    before(async () => {
        const vaultId = 'ocid1.vault.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrk57oclvejakgkh42rblwi7dmymmhnfrmt7nmloagt24mcrpl236q'
        const vault = new Vault(auth)
        const health = await auth.connect()
        assert.ok(health)
        oneVault = await vault.get(vaultId)
    })
    it('Create CSR from key in OCI Vault', async () => {

        const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrizggn5jlznyv7j64ccchehu6wc6vmfllyobilups4ahhp34pzyqq'
        const key = new Key(auth, oneVault, keyID)
        const keyPEM = await key.publicKey()

        const publicKey = ECDSAKey.FromPEM(keyPEM);
        const subject = new X500Name();
        subject.setCountryName('HK');
        subject.setOrganizationName('Hyperledger');
        subject.setOrgUnitName('blockchain');
        subject.setCommonName('davidkhala');
        const extensions = Extension.asSAN(['*.hyperledger.org']);

        const csr = new CSR({subject, pubKeyObj: publicKey.pubKeyObj, extensions});

        const unsignedHex = csr.getUnsignedHex();
        const message = Buffer.from(unsignedHex, 'hex')
        const signature_base64 = await key.sign(message)
        console.info(signature_base64);
        const sig_hex = Buffer.from(signature_base64, 'base64').toString('hex')
        const signatureAlgorithm = 'SHA256withECDSA'
        const pem = csr.toPemWithSignature(sig_hex, signatureAlgorithm)
        console.info(pem)
        fs.writeFileSync(path.resolve('test/artifacts/csr.pem'), pem)

    })

})