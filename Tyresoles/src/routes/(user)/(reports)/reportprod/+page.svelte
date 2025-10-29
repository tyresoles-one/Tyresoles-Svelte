<script lang="ts">
	import { onMount } from '$lib';
	import { ReportViewer } from '$lib/components';
	import type { InputProps } from '$lib/components/custom/types';
	import {
		fetchParamsStore,
		userStore,
	} from '$lib/managers/stores';
	import { fetchReportNames, fetchReportMeta } from './logic';
	import type { FetchParams, FilterMeta, PagedListParams, ReportMeta } from '$lib/business/models';
	import { RespCenters } from '$lib/business';
	import { endpoints } from '$lib/managers/network';
	import { required } from '$lib/managers/services/validation';

	let filterData = $state<FetchParams>({
		...$fetchParamsStore,
		respCenters:
			$fetchParamsStore?.respCenters && $fetchParamsStore.respCenters.length > 1
				? [$fetchParamsStore?.respCenters[0]]
				: []
	} as FetchParams);
	let filterMeta = $state<FilterMeta>();
	let reportMeta = $state<ReportMeta | undefined>();
	let pagedListParams = $state<PagedListParams>({
		userID: $userStore?.id ?? '',
		rowCount: 0,
		pageIndex: 0,
		searchKey: '',
		fields: '',
		criteria: {}
	});
	let endpoint = endpoints.production.productionReport;
	let filterFields = $state<InputProps[]>([
		{
			name: 'reportName',
			label: 'Select Report',
			type: 'list',
			columns: [{ name: 'name', label: 'Report Name' }],
			hideHeader: true,
			dataKey: 'name',
			labelKey: 'name',
			valueKey: 'name',
			selectionType: 'single',
			autocomplete: 'off',
			rules: [required('Report Name')],
			onselectionchange: (event: Event) => {
				reportMeta = undefined;
				if (event && event.target?.value) {
					if (filterMeta && filterMeta.reportMeta) {
						reportMeta = filterMeta.reportMeta.find((c) => c.name === event.target?.value);
					}
				}
				filterData.type = '';
				filterData.view = '';
			}
		},
		{
			name: 'from',
			label: 'From',
			type: 'date',
			preset: 'thisMonth,lastMonth,thisQuarter,lastQuarter,thisYear,lastYear,custom',
			onInput: (value: unknown, extra: unknown) => {
				if (filterData) {
					filterData.from = value as string;
					filterData.to = extra !== undefined ? (extra as string) : '';
				}
			}
		},
		{
			name: 'to',
			label: 'To',
			type: 'date'
		}
	]);

	let fieldView = $derived.by<InputProps>(() => {
		const viewOptions = reportMeta?.viewOptions.map((o) => ({ name: o }));
		return {
			name: 'view',
			label: 'Select View',
			type: 'list',
			columns: [{ name: 'name', label: 'View' }],
			hideHeader: true,
			dataKey: 'name',
			labelKey: 'name',
			valueKey: 'name',
			selectionType: 'single',
			data: viewOptions,
			value: '',
			rules: [required('View')]
		};
	});
	let fieldType = $derived.by<InputProps>(() => {
		const typeOptions = reportMeta?.typeOptions.map((o) => ({ name: o }));
		return {
			name: 'type',
			label: 'Select Type',
			type: 'list',
			columns: [{ name: 'name', label: 'Type' }],
			hideHeader: true,
			dataKey: 'name',
			labelKey: 'name',
			valueKey: 'name',
			selectionType: 'single',
			data: typeOptions,
			value: '',
			rules: [required('Type')]
		};
	});

	onMount(() => {
		pagedListParams = {
			userID: $userStore?.id ?? '',
			rowCount: 0,
			pageIndex: 0,
			searchKey: '',
			fields: '',
			criteria: {}
		};

		fetchReportMeta($userStore?.id ?? '').then((res) => {
			if (res.success) {
				filterMeta = res.data;
				const idx = filterFields.findIndex((f) => f.name === 'reportName');
				if (idx > -1) {
					filterFields = filterFields.map((f, i) =>
						i === idx ? { ...f, data: res.data?.reportNames.map((d) => ({ name: d })) } : f
					);
				}
			}
		});

		if ($fetchParamsStore?.respCenters && $fetchParamsStore?.respCenters.length > 1) {
			const idx = filterFields.findIndex((f) => f.name === 'respCenters');
			if (idx === -1) {
				filterFields.push({
					name: 'respCenters',
					label: 'Location',
					type: 'list',
					columns: [{ name: 'name', label: 'Response Center' }],
					hideHeader: true,
					dataKey: 'code',
					labelKey: 'name',
					valueKey: 'code',
					selectionType: 'multiple',
					output: 'array',
					data: $fetchParamsStore?.respCenters.map((d) => ({
						name: RespCenters.find((r) => r.code === d)?.name,
						code: d
					})),
					onselectionchange: (value: Event) => {
						//console.log(value.target?.value);
						pagedListParams = {
							criteria: { RespCenter: value.target?.value as string },
							userID: $userStore?.id ?? '',
							rowCount: 0,
							pageIndex: 0,
							searchKey: '',
							fields: ''
						};
					}
				});
			}
		} else if ($fetchParamsStore?.respCenters && $fetchParamsStore?.respCenters.length === 1) {
			pagedListParams = {
				userID: $userStore?.id ?? '',
				criteria: { RespCenter: $fetchParamsStore?.respCenters[0] },
				rowCount: 0,
				pageIndex: 0,
				searchKey: '',
				fields: ''
			};
			filterData.respCenters = [$fetchParamsStore?.respCenters[0]];
		}
	});

	$effect(() => {
		if (reportMeta?.showType && reportMeta.showType === true) {
			const idx = filterFields.findIndex((c) => c.name === 'type');
			const typeOptions = reportMeta.typeOptions.map((o) => ({ name: o }));
			if (idx === -1) {
				filterFields = [...filterFields.slice(0, 4), fieldType, ...filterFields.slice(4)];
			} else {
				// Only update if data is different
				const currentData = filterFields[idx].data ?? [];
				const isSame =
					currentData.length === typeOptions.length &&
					currentData.every((v, i) => v.name === typeOptions[i].name);
				if (!isSame) {
					filterFields = filterFields.map((f, i) => (i === idx ? { ...f, data: typeOptions } : f));
				}
			}
		} else {
			const idx = filterFields.findIndex((c) => c.name === 'type');
			if (idx > -1) {
				filterFields = filterFields.filter((_, i) => i !== idx);
			}
		}
	});
	$effect(() => {
		if (reportMeta?.showView && reportMeta.showView === true) {
			const idx = filterFields.findIndex((c) => c.name === 'view');
			const viewOptions = reportMeta.viewOptions.map((o) => ({ name: o }));
			if (idx === -1) {
				filterFields = [...filterFields.slice(0, 5), fieldView, ...filterFields.slice(5)];
			} else {
				// Only update if data is different
				const currentData = filterFields[idx].data ?? [];
				const isSame =
					currentData.length === viewOptions.length &&
					currentData.every((v, i) => v.name === viewOptions[i].name);
				if (!isSame) {
					filterFields = filterFields.map((f, i) => (i === idx ? { ...f, data: viewOptions } : f));
				}
			}
		} else {
			const idx = filterFields.findIndex((c) => c.name === 'view');
			if (idx > -1) {
				filterFields = filterFields.filter((_, i) => i !== idx);
			}
		}
	});

	$inspect(reportMeta, 'reportMeta');
</script>

<ReportViewer
	bind:filterFields
	bind:filterData
	fetchParam={filterData}
	{endpoint}
	documentName={filterData.reportName}
/>
