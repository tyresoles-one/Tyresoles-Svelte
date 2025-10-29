import type {
	ProductSale,
	ActiveCustomer,
	CustomerSales,
	SaleLine,
	CustomerSaleBalance,
	DashboardData,
	Sales,
	Item,
	CollectionData,
	Collection
} from '$lib/business/models';
import { filter } from 'd3-array';
import { groupBy, keys, maxBy, sumBy } from 'lodash-es';
import type { Snippet } from 'svelte';

export type BusinessLocation = {
	business: string;
	locations: string[];
	selections: string[];
	default: string;
};
export type BusinessCardProps = {
	businessLoc: BusinessLocation;
	children: Snippet<[]> | undefined;
};
export const prepareBusinessLocations = (input: DashboardData): BusinessLocation[] => {
	if (!input || !input.data || input.data.length === 0) return [];
	const businesses = groupBy(input.data, 'business');
	let locations = [];
	for (const business in businesses) {
		const locs = groupBy(businesses[business], 'location');
		locations.push({
			business,
			locations: keys(locs),
			selections: keys(locs),
			default: maxBy(Object.keys(locs), (k) => locs[k].length) || ''
		});
	}
	return locations;
};

export const prepareData = (
	input: DashboardData,
	busLocations: Array<BusinessLocation>
): DashboardData => {
	if (input && input.name) {
		switch (input.name) {
			case 'ProductSale':
				return prepareDataProductSale(input, busLocations);
			case 'ActiveCustomer':
				return prepareDataActiveCustomer(input, busLocations);
			case 'Collection':
				return prepareDataCollection(input, busLocations);
			default:
				return input;
		}
	}
	return input;
};

const prepareDataProductSale = (
	input: DashboardData,
	busLocations: Array<BusinessLocation>
): DashboardData => {
	if (!input || !input.data || input.data.length === 0 || input.name !== 'ProductSale')
		return input;
	let output: DashboardData = { ...input, data: [] };
	let working: DashboardData = { ...input, data: [] };
	busLocations.forEach((busLoc) => {
		const defaultLocData = input.data.filter(
			(d) => d.business === busLoc.business && d.location === busLoc.default
		) as ProductSale[];
		if (defaultLocData.length === 0) return;

		// let newProductSales: ProductSale[] = [];
		for (const defLocData of defaultLocData) {
			let newProductSales: ProductSale = { ...defLocData, data: [] };
			let newData: Array<Sales> = [];
			defLocData.data.forEach((element) => {
				const filtered = input.data.filter(
					(d) =>
						d.business === defLocData.business &&
						d.product === defLocData.product &&
						busLoc.selections.includes(d.location)
				) as ProductSale[];
				const filteredSales: Sales[] = [];
				filtered.forEach((flElement) => {
					filteredSales.push(...flElement.data.filter((fle) => fle.label === element.label));
				});

				const filteredSalesItems: Item[] = [];
				filteredSales.forEach((fs) => {
					filteredSalesItems.push(...fs.items);
				});

				let newItems: Item[] = [];
				element.items.forEach((i) => {
					const filterd = filteredSalesItems.filter((f) => f.label === i.label);
					newItems.push({ ...i, value: sumBy(filterd, 'value') });
				});
				let newRec: Sales = {
					...element,
					sale: sumBy(filteredSales, 'sale'),
					saleText:
						'' +
						(sumBy(filteredSales, 'sale') === 0
							? '-'
							: (sumBy(filteredSales, 'sale') / 100000).toFixed(2)),
					items: newItems
				};
				newData.push(newRec);
			});
			newProductSales.data = newData;
			working.data.push(newProductSales);
		} //output.data.push(...defaultLocData);
	});
	busLocations.forEach((busLoc) => {
		const firstData = working.data[0] as ProductSale;
		const locData = working.data.filter((d) => d.business === busLoc.business) as ProductSale[];
		const newData: Sales[] = [];

		firstData.data.forEach((f) => {
			const filtered: Sales[] = [];

			locData.forEach((ld) => {
				const sales = ld.data.filter((d) => d.label === f.label);
				filtered.push(...sales);
			});

			const newSale: Sales = {
				...f,
				sale: sumBy(filtered, 'sale'),
				saleText:
					'' +
					(sumBy(filtered, 'sale') === 0 ? '-' : (sumBy(filtered, 'sale') / 100000).toFixed(2)),
				items: []
			};
			newData.push(newSale);
		});

		let totalData: ProductSale = {
			product: 'Grand Total',
			business: busLoc.business,
			location: busLoc.default,
			data: newData
		} as ProductSale;
		output.data.push(totalData);
		output.data.push(...locData);
	});
	return output;
};

const prepareDataActiveCustomer = (
	input: DashboardData,
	busLocations: Array<BusinessLocation>
): DashboardData => {
	if (!input || !input.data || input.data.length === 0 || input.name !== 'ActiveCustomer')
		return input;
	let output: DashboardData = { ...input, data: [] };
	let working: DashboardData = { ...input, data: [] };
	busLocations.forEach((busLoc) => {
		const defaultLocData = input.data.filter(
			(d) => d.business === busLoc.business && d.location === busLoc.default
		) as ActiveCustomer[];
		if (defaultLocData.length === 0) return;

		//console.log(defaultLocData, 'defaultLocData');
		for (const defLocData of defaultLocData) {
			let newCustomer: ActiveCustomer = { ...defLocData, data: [] };
			let newData: Array<CustomerSales> = [];

			defLocData.data.forEach((element) => {
				const filtered = input.data.filter(
					(d) =>
						d.business === defLocData.business &&
						d.product === defLocData.product &&
						busLoc.selections.includes(d.location)
				) as ActiveCustomer[];

				const filteredSales: CustomerSales[] = [];
				filtered.forEach((flElement) => {
					filteredSales.push(
						...flElement.data.filter((fle) => fle.dateRange === element.dateRange)
					);
				});

				const filteredLinesFig: SaleLine[] = [];
				const filteredLinesQty: SaleLine[] = [];
				const filteredBalances: CustomerSaleBalance[] = [];
				filteredSales.forEach((fs) => {
					filteredLinesFig.push(
						...fs.lines.filter((fl) => fl.description === 'Sales per Customer')
					);
					filteredLinesQty.push(
						...fs.lines.filter((fl) => fl.description === 'Unit sold per Customer')
					);
					filteredBalances.push(...fs.records);
				});

				newData.push({
					...element,
					lines: [
						{
							...filteredLinesFig[0],
							amount: sumBy(filteredLinesFig, 'amount')
						},
						{
							...filteredLinesQty[0],
							amount: sumBy(filteredLinesQty, 'amount')
						}
					],
					records: filteredBalances
				});
			});
			newCustomer.data = newData;
			working.data.push(newCustomer);
		}
	});
	return working;
};

const prepareDataCollection = (
	input: DashboardData,
	busLocations: Array<BusinessLocation>
): DashboardData => {
	if (!input || !input.data || input.data.length === 0 || input.name !== 'Collection') return input;
	let working: DashboardData = { ...input, data: [] };
	busLocations.forEach((busLoc) => {
		const defaultLocData = input.data.filter(
			(d) => d.business === busLoc.business && d.location === busLoc.default
		) as CollectionData[];
		if (defaultLocData.length === 0) return;

		//console.log('defaultLocData', defaultLocData);

		for (const defLocData of defaultLocData) {
			const filtered = input.data.filter(
				(d) =>
					d.business === defLocData.business &&
					d.period === defLocData.period &&
					busLoc.selections.includes(d.location)
			) as CollectionData[];
			const newData: Array<Collection> = [];
			filtered.forEach((fd) => {
				newData.push(...fd.data);
			});

			let newCollectionData: CollectionData = {
				...defLocData,
				collection: sumBy(filtered, 'collection'),
				data: newData
			};

			working.data.push(newCollectionData);
		}
		console.log('working after default locs', working.data);
	});

	return working;
};
