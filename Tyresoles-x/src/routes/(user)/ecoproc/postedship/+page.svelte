<script lang="ts">
	import { apiFetch, endpoints } from '$lib/managers/network';
	import { fetchParamsStore, loadingStore, settingsStore } from '$lib/managers/stores';
	import { Grid, type TableColumn, type ButtonProps, updateGoBackPath } from '$lib/components';
	import { onMount, goto } from '$lib';

	let postedOrders = $state<Array<object>>([]);

	const fetchPostedOrders = () => {
		apiFetch(endpoints.production.procurementDispatchOrders, {
			method: 'POST',
			body: {
				...$fetchParamsStore
			}
		}).then((res) => {
			if (res.success) postedOrders = res.data;
		});
	};
	const columns = $state<TableColumn[]>([
		{ label: 'Date', name: 'date' },
		{ label: 'No', name: 'no', aggregation: 'count' },
		{ label: 'Qty', name: 'tyres', aggregation: 'sum' },
		{ label: 'Vehicle No', name: 'vehicleNo' },
		{ label: 'Mobile No', name: 'mobileNo' },
		{ label: 'Status', name: 'status' }
	]);

	$effect(() => {
		const flag = $fetchParamsStore?.respCenters && $fetchParamsStore?.respCenters.length > 1;
		if (flag) {
			console.log(
				'flag',
				flag,
				columns.findIndex((c) => c.name === 'destination')
			);
			if (columns.findIndex((c) => c.name === 'destination') === -1)
				columns.push({ label: 'Factory', name: 'destination' });
		}
	});

	const actions = $state<ButtonProps[]>([
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				fetchPostedOrders();
			}
		}
	]);
	onMount(() => {
		fetchPostedOrders();
		updateGoBackPath('/ecoproc');
	});
</script>

<Grid
	data={postedOrders}
	{columns}
	{actions}
	loading={$loadingStore}
	onRowClick={(row) => {
		settingsStore.update((s) => ({
			...s,
			activePage: `Posted shipment No. ${row?.no}`
		}));
		goto(`/ecoproc/postedship/${row?.no}`);
	}}
	dataKey="orderNo"
/>
