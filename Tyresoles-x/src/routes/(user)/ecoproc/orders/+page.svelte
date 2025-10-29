<script lang="ts">
	import { apiFetch, endpoints } from '$lib/managers/network';
	import type { OrderInfo } from '$lib/business/models';
	import { fetchParamsStore, loadingStore, settingsStore, orderStore } from '$lib/managers/stores';
	import { onMount, goto } from '$lib';
	import { fetchMasters } from '../logic';
	import { Grid, type TableColumn, type ButtonProps, updateGoBackPath } from '$lib/components';

	let orders = $state<OrderInfo[]>([]);
	const columns = $state<TableColumn[]>([
		{ label: 'Date', name: 'date', width: 200 },
		{ label: 'Order No', name: 'orderNo', width: 150, aggregation: 'count' },
		{ label: 'Qty', name: 'qty', aggregation: 'sum', width: 500 },
		{ label: 'Supplier', name: 'supplier', width: 150, textAlign: 'left' },
		{ label: 'Location', name: 'location', width: 100 }
	]);
	const actions = $state<ButtonProps[]>([
		{
			icon: 'Plus',
			label: 'New Order',
			variant: 'secondary',
			class: 'border-2',
			onclick: () => {
				apiFetch(endpoints.production.newProcOrder, {
					method: 'POST',
					body: {
						...$fetchParamsStore
					}
				}).then((res) => {
					if (res.success) fetchOrders();
				});
			}
		},
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				fetchOrders();
			}
		},
		{
			icon: 'FileDown',
			label: 'Get Masters',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				fetchMasters();
			}
		}
	]);
	const fetchOrders = () => {
		apiFetch(endpoints.production.procOrders, {
			method: 'POST',
			body: {
				...$fetchParamsStore
			}
		}).then((res) => {
			if (res.success) orders = res.data;
		});
	};
	onMount(() => {
		fetchOrders();
		updateGoBackPath('/ecoproc');
	});
	$inspect(orders);
</script>

<Grid
	data={orders}
	{columns}
	{actions}
	enableFilter
	loading={$loadingStore}
	onRowClick={(row) => {
		const order = row as OrderInfo;
		orderStore.set(order);
		settingsStore.update((s) => ({
			...s,
			activePage: `Order No. ${order.orderNo}`
		}));
		goto(`/ecoproc/orders/${order.orderNo}`);
	}}
	dataKey="orderNo"
/>
