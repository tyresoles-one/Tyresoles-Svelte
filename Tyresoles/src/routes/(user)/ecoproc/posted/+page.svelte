<script lang="ts">
	import { Grid, type TableColumn, type ButtonProps, updateGoBackPath } from '$lib/components';
	import type { OrderInfo } from '$lib/business/models';
	import { apiFetch, endpoints } from '$lib/managers/network';
	import { onMount, goto } from '$lib';
	import {
		fetchParamsStore,
		loadingStore,
		settingsStore,
		postedOrderStore
	} from '$lib/managers/stores';

	let orders = $state<OrderInfo[]>([]);
	const columns = $state<TableColumn[]>([
		{ label: 'Date', name: 'date', width: 200 },
		{ label: 'Order No', name: 'orderNo', width: 150, aggregation: 'count' },
		{ label: 'Qty', name: 'qty', aggregation: 'sum', width: 500 },
		{ label: 'Supplier', name: 'supplier', width: 150, textAlign: 'left' },
		{
			label: 'Amount',
			name: 'amount',
			width: 150,
			textAlign: 'right',
			aggregation: 'sum',
			formatter: (v) => (v === 0 ? '' : Number.parseFloat(v).toLocaleString('en-US'))
		},
		{ label: 'Manager', name: 'manager', width: 150, textAlign: 'left' },
		{ label: 'Location', name: 'location', width: 100 }
	]);
	const actions = $state<ButtonProps[]>([
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				fetchOrders();
			}
		}
	]);

	const fetchOrders = () => {
		apiFetch(endpoints.production.procOrders, {
			method: 'POST',
			body: {
				...$fetchParamsStore,
				view: 'Posted'
			}
		}).then((res) => {
			if (res.success) orders = res.data;
		});
	};
	onMount(() => {
		fetchOrders();
		updateGoBackPath('/ecoproc');
	});
</script>

<Grid
	data={orders}
	{columns}
	{actions}
	loading={$loadingStore}
	onRowClick={(row) => {
		const order = row as OrderInfo;
		postedOrderStore.set(order);
		settingsStore.update((s) => ({
			...s,
			activePage: `Posted Order No. ${order.orderNo}`
		}));
		goto(`/ecoproc/posted/${order.orderNo}`);
	}}
	dataKey="orderNo"
/>
