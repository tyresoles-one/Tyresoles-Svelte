export interface Vehicle {
	lineNo: number;
	no: string;
	name: string;
	status: string;
	respCenter: string;
	gstin: string;
	mobileNo: string;
	[key: string]: unknown;
}

export interface PostedSalesDocument {
	no: string;
	date: string;
	customerNo: string;
	customerName: string;
	qty: number;
	amount: number;
	[key: string]: unknown;
}

export interface CustomerAccountForDealer {
	no: string;
	name: string;
	dealerCode: string;
	mobileNo: string;
	[key: string]: unknown;
}

export interface Dealer {
	customerNo: string;
	dealerCode: string;
	product: number;
	busModel: number;
	name: string;
	email: string;
	dlrshipName: string;
	invAmt: number;
	doB: string;
	doA: string;
	doE: string;
	doJ: string;
	brdShop: number;
	pan: string;
	gst: string;
	adhar: string;
	bkName: string;
	bkAcNo: string;
	bkBrch: string;
	bkIfsc: string;
	[key: string]: unknown;
}

export interface DocumentImage {
	documentNo: string;
	type: number;
	lineNo: number;
	image: string;
	data: string;
	[key: string]: unknown;
}
