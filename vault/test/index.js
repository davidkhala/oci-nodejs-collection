const {Vault, Key} = require('../index')
const {FileAuthentication} = require('../../index')
const auth = new FileAuthentication()
const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea'
const assert = require('assert')
describe('vault', () => {
    const vault = new Vault(auth)
    before(async () => {
        const health = await auth.connect()
        assert.ok(health)
    })
    it('list', async () => {


        const result = await vault.list(compartmentId)
        console.debug(result)
    })
})
describe('key', () => {

    const vaultId = 'ocid1.vault.oc1.ap-seoul-1.bzp726oeaagiu.abuwgljr35dzjn3okjopehwmvhqtb6wx3jhw4uu3no56qita35rx4wy4zheq'
    const keyID = 'ocid1.key.oc1.ap-seoul-1.bzp726oeaagiu.abuwgljrua4t3ffaq6bsouv3y5r34udkdjiizdicaj27oitka5rp3u764caa'
    const vault = new Vault(auth)
    let oneVault
    before(async () => {
        const health = await auth.connect()
        assert.ok(health)
        oneVault = await vault.get(vaultId)
    })
    it('list', async () => {

        const key = new Key(auth, oneVault)

        const keyList = await key.list(compartmentId)
        console.debug(keyList)
    })
    it('encrypt', async () => {

        const key = new Key(auth, oneVault)

        await key.sign(keyID, 'abc')
    })
})