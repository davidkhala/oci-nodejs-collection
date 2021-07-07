const {SimpleAuthenticationDetailsProvider, Region, ConfigFileAuthenticationDetailsProvider} = require("oci-common");
const {IdentityClient} = require("oci-identity");

class _Connector {
    constructor() {
        this.provider = undefined
    }

    async connect() {
        const identityClient = new IdentityClient({
            authenticationDetailsProvider: this.provider
        });
        const {
            items,
            opcRequestId
        } = await identityClient.listRegionSubscriptions({tenancyId: this.provider.getTenantId()});
        for (const item of items) {
            if (item.isHomeRegion) {
                identityClient.regionId = item.regionName;
            }
        }
        return [identityClient, opcRequestId]
    }
}

class SimpleAuthentication extends _Connector {
    constructor({tenancy, user, fingerprint, privateKey, regionId}) {
        super()
        this.provider = new SimpleAuthenticationDetailsProvider(tenancy, user, fingerprint, privateKey, null, Region.fromRegionId(regionId));
    }
}

class FileAuthentication extends _Connector {
    constructor() {
        super()
        this.provider = new ConfigFileAuthenticationDetailsProvider()
    }

}

module.exports = {
    SimpleAuthentication,
    FileAuthentication,
}
