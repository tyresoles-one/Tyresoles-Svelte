export interface InvoiceMapper {
	oldCompany: string;
	invoiceNo: string;
}
export interface InvLineMapper {
	invNo: string;
	oldCompany: string;
	lineNo: number;
	tyre: string;
	serialNo: string;
	date: string;
	make: string;
}
export interface EntityMapper {
	type: string;
	oldCode: string;
	oldCompany: string;
	oldRespCenter: string;
	newCode: string;
	name: string;
}
