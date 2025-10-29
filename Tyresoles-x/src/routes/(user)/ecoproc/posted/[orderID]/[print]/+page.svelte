<script lang="ts">
	import { pageStore, onMount } from '$lib';
	import { ReportViewer, updateGoBackPath, type MenuItem } from '$lib/components';
	import { fetchParamsStore } from '$lib/managers/stores';
	import { endpoints } from '$lib/managers/network';
	import type { FetchParams } from '$lib/business/models';

	let reportNames = ['Posted Proc Order', 'Vendor Bill'];
	let reportName = $state<string>('Posted Proc Order');
	let closePath = `/ecoproc/posted/${$pageStore.params.orderID}`;

	let endpoint = endpoints.production.productionReport;
	let fetchParam: FetchParams = $derived<FetchParams>({
		...$fetchParamsStore,
		reportName,
		type: 'Posted',
		nos: [$pageStore.params.orderID]
	} as FetchParams);

	onMount(() => {
		updateGoBackPath(closePath);
	});
	let reportMenuItems: MenuItem[] = [
		{
			label: 'Posted Order',
			icon: 'List',
			onClick: () => {
				reportName = 'Posted Proc Order';
			}
		},
		{
			label: 'Vendor Bill',
			icon: 'File',
			onClick: () => {
				reportName = 'Vendor Bill';
			}
		}
	];
</script>

<ReportViewer
	{fetchParam}
	{endpoint}
	{closePath}
	documentName={$pageStore.params.orderID}
	{reportMenuItems}
/>
