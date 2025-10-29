import { apiFetch, endpoints, getURLSearchParams } from '$lib/managers/network';
import type { FetchParams } from '$lib/business/models';

export const fetchReportNames = (userId: string) => {
	return apiFetch(`${endpoints.accounts.reportNames}?${getURLSearchParams({ userId })}`, {
		method: 'GET'
	});
};

export const fetchReportMeta = (userId: string) => {
	return apiFetch(`${endpoints.accounts.reportMeta}?${getURLSearchParams({ userId })}`, {
		method: 'GET'
	});
};

export const fetchReport = (fetchParams: FetchParams) => {
	return apiFetch(endpoints.accounts.accountsReport, {
		method: 'POST',
		body: fetchParams
	});
};
