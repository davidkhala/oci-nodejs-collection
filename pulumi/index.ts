import * as pulumi from '@pulumi/pulumi';
import {CompartmentArgs, Compartment} from '@pulumi/oci/identity/compartment';

export class Tenancy extends Compartment {
	constructor(name: string, args: CompartmentArgs = {description: name, name}, opts?: pulumi.CustomResourceOptions) {
		super(name, args, opts);
	}
}