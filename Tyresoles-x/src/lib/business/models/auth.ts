import { filterRespCenters } from '$lib/business/navision/respCenter';
import dayjs from 'dayjs';

export interface User {
	avatar: number;
	id: string;
	language: string;
	locations: Array<userLocation>;
	menus: Array<{
		action: string;
		group: string;
		icon: string;
		iconType: string;
		order: number;
		title: string;
	}>;
	navSettings: Array<{
		label: string;
		exePath: string;
		settings: string;
	}>;
	profile: string;
	token: string;
	widgets: string;
	homePath: string;
	workDate: Date;
}

export type userLocation = {
	active: boolean;
	default: boolean;
	respCode: string;
	respName: string;
	specialToken: string;
	type: number;
	userCode: string;
	userDepartment: string;
	userName: string;
	userTitle: string;
	userType: string;
};
export type FetchParams = {
	reportName: string;
	reportOutput: string;
	type: string;
	view: string;
	from: string;
	to: string;
	customers: string[];
	dealers: string[];
	areas: string[];
	regions: string[];
	respCenters: string[];
	nos: string[];
	userCode: string;
	userType: string;
	userDepartment: string;
	userSpecialToken: string;
	userName: string;
};

export const prepareFetchParams = (user: User) => {
	const defaultLocation = user.locations.find((l) => l.default === true);
	const fetchParam: FetchParams = {
		areas: [],
		dealers: [],
		customers: [],
		nos: [],
		regions: [],
		respCenters:
			filterRespCenters(
				user.locations.map((l) => l.respCode),
				'sales'
			).map((l) => l.code) ?? [],
		to: dayjs(user.workDate).endOf('month').format('DD-MMM-YYYY'),
		type: '',
		view: '',
		userCode: defaultLocation?.userCode ?? '',
		userDepartment: defaultLocation?.userDepartment ?? '',
		userSpecialToken: defaultLocation?.specialToken ?? '',
		userName: defaultLocation?.userName ?? '',
		userType: defaultLocation?.userType ?? '',
		from: dayjs(user.workDate).startOf('month').format('DD-MMM-YYYY'),
		reportName: '',
		reportOutput: 'PDF'
	};
	return fetchParam;
};

export interface ReportMeta {
	name: string;
	typeOptions: string[];
	viewOptions: string[];
	showType: boolean;
	showView: boolean;
	showCustomers: boolean;
	showDealers: boolean;
	showAreas: boolean;
	showRegions: boolean;
	showRespCenters: boolean;
	showNos: boolean;
}

export interface RespDate {
	code: string;
	from: string;
	to: string;
}
export interface FilterMeta {
	reportNames: string[];
	respCenterDates: RespDate[];
	respCenters: string[];
	reportMeta: ReportMeta[];
}

export interface PagedListParams {
	userID: string;
	rowCount: number;
	pageIndex: number;
	searchKey: string;
	fields: string;
	criteria: { [key: string]: string };
}
