<script lang="ts">
	import { pageStore, onMount, goto } from '$lib';
	import {
		dialogShow,
		dialogHide,
		Grid,
		Input,
		PageWindow,
		updateGoBackPath
	} from '$lib/components';
	import type { OrderLine } from '$lib/business/models';
	import type { ButtonProps } from '$lib/components/custom/types';
	import { apiFetch, endpoints } from '$lib/managers/network';
	import {
		loadingStore,
		vendorStore,
		postedOrderStore,
		orderLinesStore,
		fetchParamsStore
	} from '$lib/managers/stores';

	const getOrderLines = () => {
		apiFetch(endpoints.production.procOrderLines, {
			method: 'POST',
			body: $postedOrderStore
		}).then((res) => {
			if (res.success) orderLinesStore.set(res.data);
		});
	};

	const actions: ButtonProps[] = [
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
			icon: 'Printer',
			label: 'Print',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				goto(`/ecoproc/posted/${$pageStore.params.orderID}/print`);
			}
		}
	];

	onMount(() => {
		if (!$postedOrderStore) goto('/ecoproc/posted');
		getOrderLines();
		updateGoBackPath('/ecoproc/posted');
	});
</script>

{#if $postedOrderStore}
	<PageWindow {actions} loading={$loadingStore}>
		<div class="pt-3">
			<Input
				type="list"
				data={$vendorStore ?? []}
				dataKey="no"
				labelKey="name"
				valueKey="no"
				bind:value={$postedOrderStore.supplierCode}
				selectionType="single"
				label="Supplier"
				readonly
				columns={[
					{ name: 'name', label: 'Name' },
					{ name: 'city', label: 'City' },
					{ name: 'no', label: 'Code' }
				]}
			/>
		</div>
	</PageWindow>

	<Grid
		data={$orderLinesStore ?? []}
		columns={[
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
			{ label: 'Inspector', name: 'inspector' }
		]}
	/>
{/if}
