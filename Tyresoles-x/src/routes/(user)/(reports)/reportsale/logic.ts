import { apiFetch, endpoints, getURLSearchParams } from '$lib/managers/network';
import type { FetchParams, PagedListParams, FilterMeta } from '$lib/business/models';
import {
	myAreasStore,
	myCustomersStore,
	myDealersStore,
	myRegionsStore
} from '$lib/managers/stores';

export const fetchReportNames = (userId: string) => {
	return apiFetch(`${endpoints.sales.reportNames}?${getURLSearchParams({ userId })}`, {
		method: 'GET'
	});
};

export const fetchReportMeta = (userId: string) => {
	return apiFetch(`${endpoints.sales.reportMeta}?${getURLSearchParams({ userId })}`, {
		method: 'GET'
	});
};

export const fetchReport = (fetchParams: FetchParams) => {
	return apiFetch(endpoints.sales.salesReport, {
		method: 'POST',
		body: fetchParams
	});
};

export const fetMyAreas = (pagedParams: PagedListParams) => {
	return apiFetch(endpoints.sales.myAreas, {
		method: 'POST',
		body: pagedParams
	});
};

export const fetMyDealers = (pagedParams: PagedListParams) => {
	return apiFetch(endpoints.sales.myDealers, {
		method: 'POST',
		body: pagedParams
	});
};
export const fetMyCustomers = (pagedParams: PagedListParams) => {
	return apiFetch(endpoints.sales.myCustomers, {
		method: 'POST',
		body: pagedParams
	});
};
export const fetMyRegions = (pagedParams: PagedListParams) => {
	return apiFetch(endpoints.sales.myRegions, {
		method: 'POST',
		body: pagedParams
	});
};

export const fetchMasters = (pagedParams: PagedListParams) => {
	Promise.all([
		fetMyAreas(pagedParams),
		fetMyDealers(pagedParams),
		fetMyCustomers(pagedParams),
		fetMyRegions(pagedParams)
	]).then(([respAreas, respDealers, respCustomers, respRegions]) => {
		if (respAreas.success) myAreasStore.set(respAreas.data);
		if (respDealers.success) myDealersStore.set(respDealers.data);
		if (respRegions.success) myRegionsStore.set(respRegions.data);
		if (respCustomers.success) myCustomersStore.set(respCustomers.data);
	});
};

export const userFilterMeta = (input: FilterMeta, userType: string): FilterMeta => {
	switch (userType) {
		case 'Partner': {
			if (input && input.reportMeta) {
				input.reportMeta.forEach((rptMeta) => {
					switch (rptMeta.name) {
						case 'Sales & Balance':
						case 'Sales (Retd. & Ecomile)':
						case 'Customer Trial Balance':
						case 'Statement of Account': {
							rptMeta.showAreas = false;
							rptMeta.showDealers = false;
							rptMeta.showRegions = false;
							break;
						}
					}
				});
			}
			break;
		}
	}
	return input;
};
