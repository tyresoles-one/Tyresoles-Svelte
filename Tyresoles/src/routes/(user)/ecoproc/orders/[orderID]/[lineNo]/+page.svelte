<script lang="ts">
	import {
		toast,
		Form,
		type ButtonProps,
		type InputProps,
		dialogShow,
		dialogHide,
		updateGoBackPath
	} from '$lib/components';
	import { pageStore, onMount, goto, getStore } from '$lib';
	import { required } from '$lib/managers/services/validation';
	import { newOrderLine } from '../logic.svelte';
	import {
		orderStore,
		orderLinesStore,
		itemsStore,
		inspectorsStore,
		procInspectionsStore,
		makesStore,
		loadingStore,
		fetchParamsStore
	} from '$lib/managers/stores';
	import type { OrderLine } from '$lib/business/models';
	import { apiFetch, endpoints } from '$lib/managers/network';

	let minRate = $state<number>(0);
	let maxRate = $state<number>(10000);

	let orderLine = $state<OrderLine | null | undefined>(
		Array.from($orderLinesStore ?? []).find(
			(l) => l.lineNo === Number.parseInt($pageStore.params.lineNo)
		)
	);

	const gotoOrder = () => {
		goto(`/ecoproc/orders/${$pageStore.params.orderID}`);
	};

	onMount(() => {
		updateGoBackPath(`/ecoproc/orders/${$pageStore.params.orderID}`);
	});

	$effect(() => {
		if ($pageStore.params.lineNo) {
			orderLine = Array.from($orderLinesStore ?? []).find(
				(l) => l.lineNo === Number.parseInt($pageStore.params.lineNo)
			);
		}
	});

	$effect(() => {
		if (!$orderStore || !$orderStore.supplierCode) {
			toast.error('Please select a supplier first');
			goto('/ecoproc/orders');
			return;
		}

		if (!$orderLinesStore || !orderLine) {
			gotoOrder();
		}
	});

	const fields: InputProps[] = [
		{
			name: 'itemNo',
			label: 'Tyre Size',
			type: 'list',
			data: $itemsStore ?? [],
			dataKey: 'code',
			labelKey: 'code',
			valueKey: 'code',
			selectionType: 'single',
			columns: [{ name: 'code', label: 'Tyre Size' }],
			required: true,
			hideHeader: true,
			onInput: (value, extra) => {
				const record = new Map(extra as Map<string, object>).get(value as string);

				if (record) {
					minRate = Number.parseFloat(record?.minRate);
					maxRate = Number.parseFloat(record?.maxRate);
				}
			},
			rules: [required('Tyre Size')]
		},
		{
			name: 'make',
			label: 'Make',
			type: 'list',
			data: $makesStore ?? [],
			dataKey: 'code',
			labelKey: 'name',
			valueKey: 'code',
			selectionType: 'single',
			columns: [{ name: 'name', label: 'Make' }],
			required: true,
			hideHeader: true,
			rules: [required('Make')]
		},
		{
			name: 'serialNo',
			label: 'Serial No',
			type: 'text',
			required: true,
			rules: [required('Serial No')]
		},
		{
			name: 'amount',
			label: 'Amount',
			type: 'number',
			required: true,
			inputmode: 'decimal',
			rules: [required('Amount')]
		},
		{
			name: 'inspection',
			label: 'Inspection',
			type: 'list',
			data: $procInspectionsStore ?? [],
			dataKey: 'code',
			labelKey: 'name',
			valueKey: 'code',
			selectionType: 'single',
			columns: [{ name: 'name', label: 'Inspector' }],
			required: true,
			hideHeader: true,
			rules: [required('Inspection')]
		},
		{
			name: 'inspector',
			label: 'Inspector',
			type: 'list',
			data: $inspectorsStore ?? [],
			dataKey: 'code',
			labelKey: 'name',
			valueKey: 'code',
			selectionType: 'single',
			onInput: (value: unknown, extra: unknown) => {
				if (!orderLine) return;
				orderLine.inspectorCode = value as string;
				const valueRecord = new Map(extra as Map<string, object>).get(value as string);
				if (valueRecord) {
					orderLine.inspector = valueRecord?.name;
				}
			},
			columns: [{ name: 'name', label: 'Inspector' }],
			required: true,
			hideHeader: true,
			rules: [required('Inspector')],
			hidden: $fetchParamsStore && $fetchParamsStore.userDepartment === 'Production' ? true : false
		}
	];
	const actions: ButtonProps[] = [
		{
			label: 'Save & New',
			variant: 'default',
			class: 'border-2',
			type: 'submit'
		},
		{
			label: 'Save & Close',
			variant: 'outline',
			onclick: () => {
				const isValid = validateOrderLine();
				if (!isValid) return;
				onSave();
			}
		},
		{
			label: 'Cancel',
			variant: 'outline',
			onclick: () => {
				gotoOrder();
			}
		},
		{
			label: 'Delete',
			variant: 'destructive',
			onclick: () => {
				dialogShow({
					title: 'Confirm Deletion',
					description: 'Are you sure you want to delete this tyre?',
					actionLabel: 'Delete',
					onAction: () => {
						dialogHide();
						apiFetch(endpoints.production.deleteProcOrdLine, {
							method: 'POST',
							body: {
								...orderLine
							}
						}).then((res) => {
							if (res.success) {
								toast.success('Tyre deleted successfully.');
								gotoOrder();
							}
						});
					}
				});
			}
		}
	];
	const validateOrderLine = (): boolean => {
		if (!orderLine) return false;
		if (orderLine?.amount < minRate || orderLine?.amount > maxRate) {
			toast.error(`Amount must be between ${minRate} and ${maxRate}`);
			return false;
		}
		if (orderLine.inspection === '' || orderLine.inspection === ' ') {
			toast.error('Please select an inspection');
			return false;
		}
		return true;
	};
	const handleSubmit = (data: Record<string, unknown>) => {
		// if (!orderLine) return;
		// console.log('orderLine', orderLine, minRate, maxRate);
		// if (orderLine?.amount < minRate || orderLine?.amount > maxRate) {
		// 	toast.error(`Amount must be between ${minRate} and ${maxRate}`);
		// 	return;
		// }
		// if (orderLine.inspection === '' || orderLine.inspection === ' ') {
		// 	toast.error('Please select an inspection');
		// 	return;
		// }
		const isValid = validateOrderLine();
		if (!isValid) return;
		onSave(true);
	};
	const onSave = (newLine: boolean = false) => {
		if (!orderLine) return;
		apiFetch(endpoints.production.updateProcOrdLine, {
			method: 'POST',
			body: {
				...orderLine,
				inspectorCode: orderLine?.inspectorCode || orderLine?.inspector
			}
		}).then((res) => {
			if (res.success) {
				if (newLine) newOrderLine();
				else gotoOrder();
			}
		});
	};
	//$inspect(orderLine);
</script>

<div>
	{#if orderLine}
		<Form
			{fields}
			bind:data={orderLine}
			{actions}
			onSubmit={handleSubmit}
			loading={$loadingStore}
			class="p-2"
			layoutClass="flex flex-col sm:flex-col md:flex-row  gap-2"
		/>
	{/if}
</div>
