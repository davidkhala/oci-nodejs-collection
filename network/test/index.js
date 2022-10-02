import {SimpleAuthentication} from '@davidkhala/oci-common';
import LB from '../load-balancer.js';
import WAF from '../firewall.js';
const auth = new SimpleAuthentication(process.env);
const compartmentId = 'ocid1.compartment.oc1..aaaaaaaaw2hdbvkul6ocyl6lrowdiu3y44sop4owoya5nrmhlsx7d3gbyrea';

describe('load-balancer', () => {

	const lb = new LB(auth);
	it('get load-balancer', async () => {

		const lbid = 'ocid1.loadbalancer.oc1.ap-sydney-1.aaaaaaaahvnci5ytaz3mjtbhopdge2qugtnma64sdhkxetzn475homwxqabq';
		const result = await lb.get(lbid);
		console.debug(result);
	});
	it('load balancer not found', async () => {
		const lbid = 'ocid1.networkloadbalancer.oc1.ap-sydney-1.amaaaaaahxv2vbyaybfhp7mdx65krbb46rjmcbzxudsys7dauhkzezz2vj3a';
		const result = await lb.get(lbid);
		console.debug(result);
	});
	it('network load-balancer', async () => {
		const lbid = 'ocid1.networkloadbalancer.oc1.ap-sydney-1.amaaaaaahxv2vbyaybfhp7mdx65krbb46rjmcbzxudsys7dauhkzezz2vj3a';
		const result = await lb.get(lbid, 'NetworkLoadBalancer');
		console.debug(result);
	});
	it('list load-balancer', async () => {

		const result = await lb.list(compartmentId);
		console.debug(result);
	});
});
describe('web application firewall', () => {

	const waf = new WAF(auth);
	let wafID;
	it('create WAF', async function () {
		this.timeout(0);
		const domains = ['davidkhala.com']; // Domain URL '*.davidkhala.com' is not valid
		const origins = ['152.67.106.5'];
		const result = await waf.create({compartmentId, domains, origins});
		console.info(result);
		wafID = result;
	});
	it('delete waf', async function () {
		this.timeout(0);
		await waf.delete(wafID || process.env.wafID);
	});
	it('create WAF: single origin', async function () {
		this.timeout(0);
		const domains = [Date.now() + '.davidkhala.com']; // Domain URL '*.davidkhala.com' is not valid
		const origins = '152.67.106.5';
		const result = await waf.create({compartmentId, domains, origins});
		console.info(result);
		wafID = result;
	});

	it('get WAF', async function () {
		this.timeout(0);
		const id = 'ocid1.waaspolicy.oc1..aaaaaaaaffl3vz2j3hwyoauvzkb75rpid3vx4uxyeznqz6oca3pgr7daieha';
		const result = await waf.get(wafID || id);
		console.debug(result);
	});
});
