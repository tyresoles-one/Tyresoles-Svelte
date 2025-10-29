import { apiFetch, endpoints, getURLSearchParams } from '$lib/managers/network';
import type { FetchParams } from '$lib/business/models';
import { employeesStore, departmentsStore } from '$lib/managers/stores';

export const fetchReportNames = (userId: string) => {
	return apiFetch(`${endpoints.payroll.reportNames}?${getURLSearchParams({ userId })}`, {
		method: 'GET'
	});
};

export const fetchReportMeta = (userId: string) => {
	return apiFetch(`${endpoints.payroll.reportMeta}?${getURLSearchParams({ userId })}`, {
		method: 'GET'
	});
};

export const fetchReport = (fetchParams: FetchParams) => {
	return apiFetch(endpoints.payroll.payrollReport, {
		method: 'POST',
		body: fetchParams
	});
};

export const fetchEmployees = (fetchParams: FetchParams) => {
	return apiFetch(endpoints.payroll.employeeCodeNames, {
		method: 'POST',
		body: fetchParams
	});
};

export const fetchDepartments = (fetchParams: FetchParams) => {
	return apiFetch(endpoints.payroll.departmentCodeNames, {
		method: 'POST',
		body: fetchParams
	});
};

export const fetchMasters = (fetchParams: FetchParams) => {
	Promise.all([fetchEmployees(fetchParams), fetchDepartments(fetchParams)]).then(
		([respEmployees, respDepartments]) => {
			if (respEmployees.success) employeesStore.set(respEmployees.data);
			if (respDepartments.success) departmentsStore.set(respDepartments.data);
		}
	);
};
