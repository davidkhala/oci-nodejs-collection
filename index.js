const {SimpleAuthenticationDetailsProvider, Region} = require("oci-common");
const {IdentityClient} = require("oci-identity");


class SimpleAuthentication {
    constructor({tenancy, user, fingerprint, privateKey, regionId}) {
        this.provider = new SimpleAuthenticationDetailsProvider(tenancy, user, fingerprint, privateKey, null, Region.fromRegionId(regionId));
    }

    async connect() {
        const identityClient = new IdentityClient({
            authenticationDetailsProvider: this.provider
        });
        const regions = await identityClient.listRegionSubscriptions({tenancyId: this.provider.tenancy});
        for (const item of regions.items) {
            if (item.isHomeRegion) {
                identityClient.regionId = item.regionName;
            }
        }

    }
}

module.exports = {
    SimpleAuthentication
}
