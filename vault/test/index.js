const {Vault} = require('../index')
const {FileAuthentication} = require('../../index')
describe('vault', () => {
    it('connect', async () => {
        const auth = new FileAuthentication()
        await auth.connect()
        const vault = new Vault(auth)
        const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea'
        const result = await vault.list(compartmentId)
        console.debug(result)
    })
})