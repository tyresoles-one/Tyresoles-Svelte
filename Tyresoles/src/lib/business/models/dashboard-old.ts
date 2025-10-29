export type DashboardData = {
	name: string;
	data: ProductSale[] | ActiveCustomer[] | SalesmanSale[] | CollectionData[];
};
export type ProductSale = {
	no: number;
	business: string;
	location: string;
	product: string;
	data: Sales[];
};
export type Sales = {
	no: number;
	label: string;
	sale: number;
	saleText: string;
	saleUnit: string;
	dateRange: string;
	items: Item[];
};

export type Item = {
	no: number;
	label: string;
	value: number;
	unit: string;
};

export interface CustomerSaleBalance {
	code: string;
	name: string;
	sale: number;
	balance: number;
}
export interface SaleLine {
	amount: number;
	unit: string;
	description: string;
}

export interface ActiveCustomer {
	no: number;
	business: string;
	location: string;
	product: string;
	data: CustomerSales[];
}
export interface CustomerSales {
	no: number;
	label: string;
	dateRange: string;
	lines: SaleLine[];
	records: CustomerSaleBalance[];
}

export interface SalesmanSale {
	product: string;
	data: object[];
}

export interface CollectionData {
	period: string;
	collection: number;
	business: string;
	location: string;
	no: number;
	data: Collection[];
}

export interface Collection {
	date: string;
	type: string;
	customerNo: string;
	name: string;
	amount: string;
	amt: number;
}
