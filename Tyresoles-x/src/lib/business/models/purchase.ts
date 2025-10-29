export interface Vendor {
	no: string;
	name: string;
	address: string;
	address2: string;
	city: string;
	postCode: string;
	stateCode: string;
	category: string;
	detail: string;
	mobileNo: string;
	respCenter: string;
	ecoMgrCode: string;
	nameOnInvoice: string;
	bankName: string;
	bankAccNo: string;
	bankIFSC: string;
	bankBranch: string;
	panNo: string;
	adhaarNo: string;
	selfInvoice: boolean;
	balance: number;
	[key: string]: unknown;
}
