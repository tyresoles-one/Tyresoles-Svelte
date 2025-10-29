<script lang="ts">
	import { apiFetch, endpoints } from '$lib/managers/network';
	import { fetchParamsStore, loadingStore, itemsStore, makesStore } from '$lib/managers/stores';
	import type { OrderLineDispatch } from '$lib/business/models';
	import { goto, pageStore, onMount } from '$lib';
	import { required } from '$lib/managers/services/validation';

	import {
		Grid,
		type TableColumn,
		type ButtonProps,
		DialogPage,
		Input,
		dialogShow,
		dialogHide,
		toast,
		updateGoBackPath,
		Form
	} from '$lib/components';

	let data = $state<OrderLineDispatch[]>([]);
	let selectedValues = $state<Set<string>>(new Set());
	let selections = $state<Map<string, object>>(new Map());
	let open = $state(false);
	let openForm = $state(false);
	let purchaseOrders = $state<string[]>([]);
	let orderLine = $state<OrderLineDispatch | null>(null);
	let enableSelection = $derived.by<boolean>(() => {
		return (
			$fetchParamsStore?.userDepartment === 'Administration' &&
			data.length > 0 &&
			data.find((d) => d.orderStatus === 'Dispatched') !== undefined
		);
	});

	const fetchOrderLines = () => {
		apiFetch(endpoints.production.procOrderLinesDispatch, {
			method: 'POST',
			body: {
				...$fetchParamsStore,
				Nos: [$pageStore.params.orderID],
				Type: 'Dispatch'
			}
		}).then((res) => {
			if (res.success) {
				data = res.data;
				if ($fetchParamsStore?.userDepartment === 'Administration') {
					const dispatched = data.find((d) => d.orderStatus === 'Dispatched');
					const recieved = data.find((d) => d.orderStatus === 'Received At Factory');
					if (dispatched) {
						const idx = actions.findIndex((a) => a.label === 'Recieve');
						if (idx === -1) {
							actions.push({
								icon: 'Download',
								label: 'Recieve',
								variant: 'outline',
								class: 'border-2',
								onclick: () => {
									if (!selections.size) {
										toast.error('There should be at least one tyre selected.');
										return;
									}
									dialogShow({
										title: 'Confirm Recieve',
										description: 'Are you sure you want to recieve these tyres?',
										actionLabel: 'Recieve',
										onAction: () => {
											dialogHide();
											apiFetch(endpoints.production.updateProcOrdLinesReceipt, {
												method: 'POST',
												body: Array.from(selections.values()).map((obj) => ({
													...obj,
													inspector: $fetchParamsStore?.userCode
												}))
											}).then((res) => {
												if (res.success) {
													fetchOrderLines();
													selectedValues = new Set();
													toast.success('Tyres Recieved');
												}
											});
										}
									});
								}
							});
						}
						const idx2 = actions.findIndex((a) => a.label === 'Remove');
						if (idx2 === -1) {
							actions.push({
								icon: 'PackageMinus',
								label: 'Remove',
								variant: 'outline',
								class: 'border-2',
								onclick: () => {
									if (!selections.size) {
										toast.error('There should be at least one tyre selected.');
										return;
									}
									dialogShow({
										title: 'Confirm Remove',
										description: 'Are you sure you want to remove these tyres?',
										actionLabel: 'Remove',
										onAction: () => {
											dialogHide();
											apiFetch(endpoints.production.updateProcOrdLinesRemove, {
												method: 'POST',
												body: Array.from(selections.values()).map((obj) => ({
													...obj,
													inspector: $fetchParamsStore?.userCode
												}))
											}).then((res) => {
												if (res.success) {
													fetchOrderLines();
													selectedValues = new Set();
													toast.success('Tyres Removed');
												}
											});
										}
									});
								}
							});
						}
					}
					if (recieved) {
						const idxRecieve = actions.findIndex((a) => a.label === 'Recieve');
						const idxRemove = actions.findIndex((a) => a.label === 'Remove');
						if (idxRecieve !== -1) {
							actions.splice(idxRecieve, 1);
						}
						if (idxRemove !== -1) {
							actions.splice(idxRemove, 1);
						}

						const idx = actions.findIndex((a) => a.label === 'Generate GRAs');
						if (idx === -1) {
							actions.push({
								icon: 'FileInput',
								label: 'Generate GRAs',
								variant: 'outline',
								class: 'border-2',
								onclick: () => {
									dialogShow({
										title: 'Confirm Generation of GRAs',
										description: 'Are you sure you want to generate GRAs for this shipment?',
										actionLabel: 'Generate',
										onAction: () => {
											dialogHide();
											purchaseOrders = [];
											apiFetch(endpoints.production.generateGRAs, {
												method: 'POST',
												body: { ...$fetchParamsStore, reportName: $pageStore.params.orderID }
											}).then((res) => {
												if (res.success && res.data) {
													purchaseOrders = String(res.data).split(',');
													toast.success(`${purchaseOrders.length} GRAs Generated`);
												}
											});
										}
									});
								}
							});
						}
					}
				}
			}
		});
	};
	onMount(() => {
		fetchOrderLines();
		updateGoBackPath('/ecoproc/postedship');
	});

	const columns = $state<TableColumn[]>([
		{ label: 'Size', name: 'no', aggregation: 'count' },
		{ label: 'Make', name: 'make' },
		{ label: 'Serial No', name: 'serialNo' },
		{ label: 'Supplier', name: 'supplier' },
		{ label: 'Market', name: 'location' },
		{ label: 'Inspector', name: 'inspector' },
		{ label: 'Inspection', name: 'inspection' },
		{ label: 'Status', name: 'orderStatus' }
	]);
	const actions = $state<ButtonProps[]>([
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				fetchOrderLines();
			}
		},
		{
			icon: 'Printer',
			label: 'Print',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				goto(`/ecoproc/postedship/${$pageStore.params.orderID}/print`);
			}
		}
	]);

	$effect(() => {
		if (purchaseOrders.length > 0) {
			const idx = actions.findIndex((a) => a.label === 'Show GRA Nos');
			if (idx === -1) {
				actions.push({
					label: 'Show GRA Nos',
					variant: 'outline',
					class: 'border-2',
					onclick: () => {
						open = true;
					}
				});
			}
		}
	});
</script>

<div class="m-2 flex flex-col gap-2 md:flex-row lg:flex-row">
	<Input value={data[0]?.date} readonly />
	<Input value={data[0]?.dispatchDestination} readonly />
	<Input value={data[0]?.dispatchTransporter} readonly />
	<Input value={data[0]?.dispatchVehicleNo} readonly />
	<Input value={data[0]?.dispatchMobileNo} readonly />
</div>
<Grid
	{data}
	{columns}
	loading={$loadingStore}
	{actions}
	{enableSelection}
	bind:selectedValues
	selectionType="multiple"
	dataKey="orderNo,lineNo"
	onSelectionChange={(selection) => {
		selections = selection;
	}}
	onRowClick={(row) => {
		orderLine = row as OrderLineDispatch;
		if (orderLine.orderStatus === 'Purchased' || data.find((d) => d.orderStatus === 'Purchased'))
			return;
		openForm = true;
	}}
/>

{#if orderLine && $fetchParamsStore?.userDepartment === 'Administration'}
	<DialogPage
		open={openForm}
		onOpenChange={(o) => (openForm = o)}
		onAction={() => {
			openForm = false;
			dialogShow({
				title: 'Confirm Save',
				description: 'Are you sure you want to save the changes to this tyre?',
				actionLabel: 'Save',
				onAction: () => {
					dialogHide();
					apiFetch(endpoints.production.updateProcOrdLinesDispatch2, {
						method: 'POST',
						body: {
							...orderLine
						}
					}).then((res) => {
						if (res.success) {
							fetchOrderLines();
							toast.success('Tyre Saved');
						}
					});
				},
				onCancel: () => {
					fetchOrderLines();
				}
			});
		}}
		actionLabel="Save"
		title="Tyre Details"
	>
		<Form
			bind:data={orderLine}
			layoutClass="flex flex-col sm:flex-col md:grid md:grid-cols-2  gap-2"
			fields={[
				{
					name: 'no',
					label: 'Tyre Size',
					type: 'list',
					data: $itemsStore ?? [],
					dataKey: 'code',
					labelKey: 'code',
					valueKey: 'code',
					columns: [{ name: 'code', label: 'Tyre Size' }],
					required: true,
					hideHeader: true,
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
					name: 'orderStatus',
					label: 'Status',
					type: 'list',
					data: [
						{ code: 'Dispatched' },
						{ code: 'Rejected' },
						{ code: 'Dropped' },
						{ code: 'Returned' }
					],
					hideHeader: true,
					dataKey: 'code',
					labelKey: 'code',
					valueKey: 'code'
				}
			]}
		/>
	</DialogPage>
{/if}

<DialogPage
	{open}
	onOpenChange={(o) => (open = o)}
	title={`${purchaseOrders.length} Generated GRAs`}
	description="These are the GRAs generated for this shipment"
	actionLabel="Close"
	onAction={() => (open = false)}
>
	<div class="flex flex-col gap-2">
		{#each purchaseOrders as po}
			<Input readonly value={po} />
		{/each}
	</div>
</DialogPage>
