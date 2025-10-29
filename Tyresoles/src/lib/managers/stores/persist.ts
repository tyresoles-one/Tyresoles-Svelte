import { useLocalStorageStore, storeKeys } from './base';
import type {
	User,
	FetchParams,
	Settings,
	Vendor,
	CodeName,
	Vehicle,
	DashboardData
} from '$lib/business/models';
import { SIDEBAR_OPEN_TIMEOUT } from '$lib/system';
import dayjs from 'dayjs';

export const userStore = useLocalStorageStore<User>(storeKeys.user);
export const fetchParamsStore = useLocalStorageStore<FetchParams>(storeKeys.fetchParams);
export const vendorStore = useLocalStorageStore<Array<Vendor> | null>(storeKeys.vendors);
export const vehicleStore = useLocalStorageStore<Array<Vehicle> | null>(storeKeys.vehicles);
export const makesStore = useLocalStorageStore<Array<CodeName> | null>(storeKeys.makes);
export const itemsStore = useLocalStorageStore<Array<CodeName> | null>(storeKeys.items);
export const inspectorsStore = useLocalStorageStore<Array<CodeName> | null>(storeKeys.inspectors);
export const procInspectionsStore = useLocalStorageStore<Array<CodeName> | null>(
	storeKeys.procInspections
);
export const settingsStore = useLocalStorageStore<Settings>(storeKeys.settings);
export const myAreasStore = useLocalStorageStore<Array<CodeName> | null>(storeKeys.myAreas);
export const myCustomersStore = useLocalStorageStore<Array<CodeName> | null>(storeKeys.myCustomers);
export const myRegionsStore = useLocalStorageStore<Array<CodeName> | null>(storeKeys.myRegions);
export const myDealersStore = useLocalStorageStore<Array<CodeName> | null>(storeKeys.myDealers);
export const employeesStore = useLocalStorageStore<Array<CodeName> | null>(storeKeys.employees);
export const departmentsStore = useLocalStorageStore<Array<CodeName> | null>(storeKeys.departments);
export const dashboardDataStore = useLocalStorageStore<DashboardData | null>(
	storeKeys.dashboardData
);

export const setDefaultSettings = () => {
	settingsStore.set({
		homePath: '/',
		backPath: '/',
		sidebarOpenTimeout: SIDEBAR_OPEN_TIMEOUT,
		enableSidebarAutoClose: true,
		respCode: '',
		workDate: dayjs().format('DD-MMM-YYYY'),
		activePage: ''
	});
};

export const clearAll = () => {
	userStore.set(null);
	fetchParamsStore.set(null);
	vendorStore.set(null);
	makesStore.set(null);
	itemsStore.set(null);
	inspectorsStore.set(null);
	procInspectionsStore.set(null);
};
