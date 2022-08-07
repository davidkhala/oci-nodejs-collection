import {CSR} from '@davidkhala/crypto/forge/pki.js'
import {Key, Vault} from "../index.js";
import {FileAuthentication} from '../../common/index.js'
import assert from "assert";

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
    it('get public key', async () => {

        const keyID = 'ocid1.key.oc1.ap-singapore-1.enrhpwtoaabem.abzwsljrizggn5jlznyv7j64ccchehu6wc6vmfllyobilups4ahhp34pzyqq'
        const key = new Key(auth, oneVault)
        const keyInfo = await key.publicKeyOf(keyID)
        console.debug(keyInfo)


    })
    it('todo', ()=>{
        const subject = {
            commonName: 'oracle',
            countryName: 'China',
            localityName: 'HongKong',
            organizationName: 'hyperledger.org'
        };
        const attrs = {
            challengePassword: 'password',
            unstructuredName: 'My Company, Inc.',
            extensionRequest: {
                subjectAltName: ['test.domain.com', 'www.oracle.com', 'www.hyperledger.org']
            }
        };

    })
})