import { writable, type Writable } from 'svelte/store';

export function createLocalStorageStore<T>(key: string): Writable<T | null> {
	const isBrowser = typeof window !== 'undefined';
	let data: T | null = null;

	// Initialize the store with data from localStorage if in the browser
	if (isBrowser) {
		const item = localStorage.getItem(key);
		data = item && item !== 'undefined' ? JSON.parse(item) : null;
	}

	const { subscribe, set, update } = writable<T | null>(data);

	return {
		subscribe,
		set: (value: T | null) => {
			if (isBrowser) {
				if (value === null) {
					localStorage.removeItem(key);
				} else {
					localStorage.setItem(key, JSON.stringify(value));
				}
			}
			// Always call set to notify subscribers
			set(value);
		},
		update: (updater: (value: T | null) => T | null) => {
			update((currentValue) => {
				const newValue = updater(currentValue);
				if (isBrowser) {
					if (newValue === null) {
						localStorage.removeItem(key);
					} else {
						localStorage.setItem(key, JSON.stringify(newValue));
					}
				}
				return newValue;
			});
		}
	};
}

export function useLocalStorageStore<T>(key: string): Writable<T | null> {
	const store = createLocalStorageStore<T>(key);
	return store;
}

export const storeKeys = {
	user: 'user',
	fetchParams: 'fetchParams',
	settings: 'settings',
	makes: 'makes',
	items: 'items',
	vendors: 'vendors',
	vehicles: 'vehicles',
	vendorDetail: 'vendorDetail',
	inspectors: 'inspectors',
	procInspections: 'procInspections',
	procOrders: 'procOrders',
	procOrdersPosted: 'procOrdersPosted',
	procOrderLines: 'procOrderLines',
	rowSelection: 'rowSelection',
	myCustomers: 'myCustomers',
	myAreas: 'myAreas',
	myDealers: 'myDealers',
	myRegions: 'myRegions',
	employees: 'employees',
	departments: 'departments',
	dashboardData: 'dashboardData'
};
