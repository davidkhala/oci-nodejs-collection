import {CustomResourceOptions} from '@pulumi/pulumi/resource';
import {CompartmentArgs, Compartment} from '@pulumi/oci/identity/compartment';

export class Tenancy extends Compartment {
	constructor(name: string, args: CompartmentArgs = {description: name, name}, opts?: CustomResourceOptions) {
		super(name, args, opts);
	}
}