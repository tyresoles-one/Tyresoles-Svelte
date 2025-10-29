<script lang="ts">
	import { pageStore, onMount, goto } from '$lib';
	import {
		dialogShow,
		dialogHide,
		Grid,
		Input,
		PageWindow,
		toast,
		updateGoBackPath
	} from '$lib/components';
	import type { ButtonProps } from '$lib/components/custom/types';
	import { apiFetch, endpoints } from '$lib/managers/network';
	import { newOrderLine } from './logic.svelte';
	import {
		loadingStore,
		vendorStore,
		orderStore,
		orderLinesStore,
		fetchParamsStore
	} from '$lib/managers/stores';

	const getOrderLines = () => {
		apiFetch(endpoints.production.procOrderLines, {
			method: 'POST',
			body: $orderStore
		}).then((res) => {
			if (res.success) orderLinesStore.set(res.data);
		});
	};

	const actions: ButtonProps[] = [
		{
			icon: 'Plus',
			label: 'New Tyre',
			variant: 'outline',
			class: 'border-2 border-slate-300',
			onclick: newOrderLine
		},
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				getOrderLines();
			}
		},
		{
			icon: 'Send',
			label: 'Post Order',
			variant: 'outline',
			class: 'border-2 border-blue-200',
			onclick: () => {
				handlePostOrder();
			}
		},
		{
			icon: 'Trash2',
			label: 'Delete Order',
			variant: 'outline',
			class: 'border-2 border-red-200',
			onclick: () => {
				handleDeleteOrder();
			}
		}
	];

	onMount(() => {
		if (!$orderStore) goto('/ecoproc/orders');
		getOrderLines();
		updateGoBackPath('/ecoproc/orders');
	});

	const updateOrder = (post: boolean = false) => {
		apiFetch(endpoints.production.updateProcOrd, {
			method: 'POST',
			body: post === true ? { ...$orderStore, status: 1 } : $orderStore
		}).then((res) => {
			if (res.success && post === true) {
				toast.success('Order Posted Successfully.');
				goto('/ecoproc/orders');
			}
		});
	};
	const handlePostOrder = () => {
		if (!$orderStore) {
			toast.error('Invalid Order for Posting.');
			return;
		}
		if ($orderStore?.qty === 0) {
			toast.error('Please add at least one tyre.');
			return;
		}
		dialogShow({
			title: 'Confirm Posting',
			description: 'Are you sure you want to post this order?',
			actionLabel: 'Post',
			onAction: () => {
				dialogHide();
				updateOrder(true);
			}
		});
	};
	const handleDeleteOrder = () => {
		if (!$orderStore) {
			toast.error('Invalid Order for Posting.');
			return;
		}
		dialogShow({
			title: 'Confirm Order Deletion',
			description: 'Are you sure you want to delete this order?',
			actionLabel: 'Delete',
			onAction: () => {
				dialogHide();
				apiFetch(endpoints.production.deleteProcOrder, {
					method: 'POST',
					body: $orderStore
				}).then((res) => {
					if (res.success) {
						toast.success('Order Deleted Successfully.');
						goto('/ecoproc/orders');
					}
				});
			}
		});
	};
</script>

<PageWindow loading={$loadingStore} {actions}>
	{#if $orderStore}
		<div class="mt-2 flex flex-col gap-2">
			<Input
				type="list"
				data={$vendorStore ?? []}
				dataKey="no"
				labelKey="name"
				valueKey="no"
				bind:value={$orderStore.supplierCode}
				selectionType="single"
				label="Supplier"
				columns={[
					{ name: 'name', label: 'Name' },
					{ name: 'city', label: 'City' },
					{ name: 'no', label: 'Code' }
				]}
				onInput={(value, extra) => {
					updateOrder();
				}}
			/>
		</div>
	{/if}
</PageWindow>
<Grid
	data={$orderLinesStore ?? []}
	columns={[
		{ label: 'Sort No', name: 'sortNo' },
		{ label: 'Tyre Size', name: 'itemNo' },
		{ label: 'Serial No', name: 'serialNo' },
		{ label: 'Make', name: 'make', aggregation: 'count' },
		{
			label: 'Amount',
			name: 'amount',
			aggregation: 'sum',
			textAlign: 'right',
			formatter: (v) => {
				return v === 0 || undefined ? '' : Number.parseFloat(v).toLocaleString('en-US');
			}
		},
		{ label: 'Inspection', name: 'inspection', textAlign: 'left' },
		{ label: 'Inspector', name: 'inspector', textAlign: 'left' }
	]}
	onRowClick={(row) => {
		goto(`/ecoproc/orders/${$pageStore.params.orderID}/${row?.lineNo}`);
	}}
/>
