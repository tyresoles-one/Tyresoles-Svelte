export interface CasingItemWrap {
	items: CasingItem[];
}
export interface CasingItem {
	code: string;
	minRate: string;
	maxRate: string;
	category: string;
}
export type OrderInfo = {
	date: string;
	orderNo: string;
	supplier: string;
	supplierCode: string;
	location: string;
	respCenter: string;
	manager: string;
	managerCode: string;
	amount: number;
	qty: number;
	status: number;
};
export interface OrderLine {
	no: string;
	date: Date;
	lineNo: number;
	vendorNo: string;
	itemNo: string;
	make: string;
	serialNo: string;
	inspection: string;
	inspector: string;
	inspectorCode: string;
	amount: number;
	sortNo: string;
	[key: string]: unknown;  
}

export interface OrderLineDispatch {
	orderNo: string;
	lineNo: number;
	no: string;
	make: string;
	serialNo: string;
	supplier: string;
	location: string;
	inspector: string;
	inspection: string;
	orderStatus: string;
	dispatchOrderNo: string;
	dispatchDate: string;
	dispatchDestination: string;
	dispatchVehicleNo: string;
	dispatchMobileNo: string;
	dispatchTransporter: string;
	button: string;
	model: string;
	newSerialNo: string;
	factInspector: string;
	factInspection: string;
	factInspectorFinal: string;
	rejectionReason: string;
	remark: string;
	date: string;
	[key: string]: unknown;
}
export interface ShipmentInfo {
	[key: string]: unknown;
	no: string;
	date: string;
	destination: string;
	vehicleNo: string;
	mobileNo: string;
	transport: string;
}