import {DnsClient, DnsWaiter} from 'oci-dns'
import {AbstractService} from '@davidkhala/oci-common'

class Steering extends AbstractService {
	constructor(connect) {
		super(connect, DnsClient);
		this.withWaiter(DnsWaiter)
	}


}