const {SimpleAuthentication, FileAuthentication} = require('../index')
const tenancy = 'ocid1.tenancy.oc1..aaaaaaaakatveh74zmu3624wgdcs2zcud5emtkpeqrv3b4xnc6gwlw52nvtq'
const user = 'ocid1.user.oc1..aaaaaaaagu3ghstfw5oynuruw6hudunbjsmroyko6ue6lnshxumwskv2ipjq'
const {privateKey, fingerprint} = process.env
const regionId = 'ap-seoul-1';
describe('simpleAuth', () => {
    it('connect', async () => {
        const auth = new SimpleAuthentication({tenancy, user, fingerprint, privateKey, regionId});

        await auth.connect()
    })

})
describe('config file auth', () => {
    it('connect', async () => {
        const auth = new FileAuthentication()
        await auth.connect()
    })
})

