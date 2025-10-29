<script lang="ts">
	import type { FetchParams, CustomerAccountForDealer } from '$lib/business/models';
	import { filterRespCenters } from '$lib/business/navision';
	import { fetchParamsStore, loadingStore, settingsStore } from '$lib/managers/stores';
	import { apiFetch, endpoints } from '$lib/managers/network';
	import { Grid } from '$lib/components';
	import { onMount, goto } from '$lib';

	let fetchParams = $state<FetchParams>({
		...$fetchParamsStore,
		respCenters: filterRespCenters($fetchParamsStore?.respCenters || [], 'tyre').map((c) => c.code),
		view: 'All'
	} as FetchParams);

	let data = $state<CustomerAccountForDealer[]>([]);

	const fetchList = () => {
		apiFetch(endpoints.sales.CustomerAccountForDealer, {
			method: 'POST',
			body: fetchParams
		}).then((resp) => {
			if (resp.success) {
				data = resp.data;
			}
		});
	};

	onMount(() => {
		fetchList();
	});

	$inspect(data, 'data');
</script>

<Grid
	{data}
	loading={$loadingStore}
	columns={[
		{ name: 'no', label: 'No' },
		{ name: 'name', label: 'Name' },
		{ name: 'mobileNo', label: 'Mobile No' },
		{ name: 'dealerCode', label: 'Dealer Code' }
	]}
	actions={[
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			menuItems: [
				{
					label: 'New',
					icon: 'UserPlus',
					onClick: () => {
						fetchParams.view = 'New';
						fetchList();
					}
				},
				{
					label: 'All',
					icon: 'Users',
					onClick: () => {
						fetchParams.view = 'All';
						fetchList();
					}
				}
			],
			onclick: () => {
				fetchList();
			}
		}
	]}
	onRowClick={(row) => {
		settingsStore.update((s) => ({
			...s,
			activePage: `Dealer No. ${row?.no}`
		}));
		goto(`/dealers/${row?.no}`);
	}}
/>
