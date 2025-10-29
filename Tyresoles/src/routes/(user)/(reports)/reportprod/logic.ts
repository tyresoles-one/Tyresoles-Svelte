import { apiFetch, endpoints, getURLSearchParams } from '$lib/managers/network';
import type { FetchParams } from '$lib/business/models';

export const fetchReportNames = (userId: string) => {
	return apiFetch(`${endpoints.production.reportNames}?${getURLSearchParams({ userId })}`, {
		method: 'GET'
	});
};

export const fetchReportMeta = (userId: string) => {
	return apiFetch(`${endpoints.production.reportMeta}?${getURLSearchParams({ userId })}`, {
		method: 'GET'
	});
};

export const fetchReport = (fetchParams: FetchParams) => {
	return apiFetch(endpoints.production.productionReport, {
		method: 'POST',
		body: fetchParams
	});
};
