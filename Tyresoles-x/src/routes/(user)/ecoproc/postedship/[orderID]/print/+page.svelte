<script lang="ts">
	import { pageStore, onMount } from '$lib';
	import { ReportViewer, updateGoBackPath, type MenuItem } from '$lib/components';
	import { fetchParamsStore } from '$lib/managers/stores';
	import { endpoints } from '$lib/managers/network';
	import type { FetchParams } from '$lib/business/models';

	let reportName = $state<string>('Posted Dispatch Order');
	let closePath = `/ecoproc/postedship/${$pageStore.params.orderID}`;

	let endpoint = endpoints.production.productionReport;
	let fetchParam: FetchParams = $derived<FetchParams>({
		...$fetchParamsStore,
		reportName,
		nos: [$pageStore.params.orderID]
	} as FetchParams);

	let reportMenuItems: MenuItem[] = [
		{
			label: 'Details',
			icon: 'List',
			onClick: () => {
				reportName = 'Posted Dispatch Details';
			}
		},
		{
			label: 'Summary',
			icon: 'File',
			onClick: () => {
				reportName = 'Posted Dispatch Order';
			}
		},
		{
			label: 'Inspection',
			icon: 'File',
			onClick: () => {
				reportName = 'Casing Inspection';
			}
		},
		{
			label: 'New Numbering',
			icon: 'ListPlus',
			onClick: () => {
				reportName = 'Casing New Numbering';
			}
		},
		{
			label: 'Vendor Bills',
			icon: 'File',
			onClick: () => {
				reportName = 'Vendor Bill';
			}
		}
	];

	onMount(() => {
		updateGoBackPath(closePath);
	});
</script>

<ReportViewer
	{fetchParam}
	{endpoint}
	{closePath}
	documentName={$pageStore.params.orderID}
	{reportMenuItems}
/>
