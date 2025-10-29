<script lang="ts">
	import { onMount, goto } from '$lib';
	import {
		Grid,
		updateGoBackPath,
		DialogPage,
		Form,
		dialogHide,
		dialogShow,
		toast
	} from '$lib/components';
	import { apiFetch, endpoints, getURLSearchParams } from '$lib/managers/network';
	import { loadingStore, settingsStore, fetchParamsStore } from '$lib/managers/stores';
	import type { OrderLineDispatch } from '$lib/business/models';
	import type { TableColumn, ButtonProps } from '$lib/components/custom/types';
	import { required } from '$lib/managers/services/validation';
	import { incrementAlphanumeric } from '$lib/managers/services/text';

	let data = $state<OrderLineDispatch[]>([]);
	let view = $state<'Blank' | 'All'>('Blank');
	let ecomileLastNumber = $state<string>('');
	let openForm = $state<boolean>(false);
	let orderLine = $state<OrderLineDispatch | null>(null);
	let dateFilter = $state<{ fromDate: string; toDate: string }>({
		fromDate: '',
		toDate: ''
	});
	let filter = $state<boolean>(false);

	$effect(() => {
		settingsStore.update((s) => ({
			...s,
			activePage: `Last Used New Number ${ecomileLastNumber}`
		}));
	});

	onMount(() => {
		fetchOrderLinesNewNumbering();
		getEcomileLastNumber();
		updateGoBackPath('/ecoproc');
	});

	const fetchOrderLinesNewNumbering = () => {
		apiFetch(endpoints.production.procOrderLinesNewNumbering, {
			method: 'POST',
			body: {
				...$fetchParamsStore,
				respCenters: [$fetchParamsStore?.respCenters?.[0]],
				view,
				from: dateFilter.fromDate,
				to: dateFilter.toDate
			}
		}).then((res) => {
			if (res.success) {
				console.log(res.data);
				data = res.data;
			}
		});
	};
	const getEcomileLastNumber = () => {
		apiFetch(
			`${endpoints.production.ecomileLastNewNumber}?${getURLSearchParams({ respCenter: $fetchParamsStore?.respCenters[0] ?? 'BEL' }).toString()}`,
			{
				method: 'GET'
			}
		).then((res) => {
			if (res.success) {
				console.log(res.data);
				ecomileLastNumber = res.data;
			}
		});
	};

	const actions: ButtonProps[] = [
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			menuItems: [
				{
					label: 'Blank',
					icon: 'FileDigit',
					onClick: () => {
						view = 'Blank';
						fetchOrderLinesNewNumbering();
					}
				},
				{
					label: 'All',
					icon: 'ListOrdered',
					onClick: () => {
						view = 'All';
						fetchOrderLinesNewNumbering();
					}
				}
			],
			onclick: () => {
				fetchOrderLinesNewNumbering();
				getEcomileLastNumber();
			}
		},
		{
			icon: 'Calendar1',
			label: 'Filter',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				filter = !filter;
			}
		}
	];

	const columns: TableColumn[] = [
		{ label: 'Tyre Size', name: 'no', aggregation: 'count' },
		{ label: 'Make', name: 'make', textAlign: 'left' },
		{ label: 'Serial No', name: 'serialNo', textAlign: 'left' },
		{ label: 'New Serial No', name: 'newSerialNo', textAlign: 'left' },
		{ label: 'Market', name: 'location', textAlign: 'left' },
		{ label: 'Date', name: 'date', textAlign: 'left' }
	];
</script>

<Grid
	{data}
	{actions}
	{columns}
	loading={$loadingStore}
	footer
	onRowClick={(row) => {
		orderLine = row as OrderLineDispatch;
		if (!orderLine.newSerialNo) orderLine.newSerialNo = incrementAlphanumeric(ecomileLastNumber);
		openForm = true;
	}}
/>

{#if orderLine}
	<DialogPage
		open={openForm}
		onOpenChange={(o) => (openForm = o)}
		onEscapeKeydown={() => {
			if (orderLine) orderLine.newSerialNo = '';
		}}
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
							toast.success('Tyre Saved');
							fetchOrderLinesNewNumbering();
							getEcomileLastNumber();
						}
					});
				},
				onCancel: () => {
					fetchOrderLinesNewNumbering();
					getEcomileLastNumber();
				}
			});
		}}
		actionLabel="Save"
		title={`${orderLine.no} - ${orderLine.make} - ${orderLine.serialNo}`}
	>
		<Form
			bind:data={orderLine}
			layoutClass="flex flex-col sm:flex-col md:grid md:grid-cols-2 gap-2 p-4"
			fields={[
				{
					name: 'newSerialNo',
					label: 'New Serial No',
					type: 'text',
					required: true,
					rules: [required('Serial No')]
				}
			]}
		/>
	</DialogPage>
{/if}

<DialogPage
	open={filter}
	onOpenChange={(o) => (filter = o)}
	title="Filter"
	onAction={() => {
		filter = false;
		fetchOrderLinesNewNumbering();
	}}
	actionLabel="Apply">
	<Form 
		bind:data={dateFilter}
		fields={[
			{
				name: 'fromDate',
				label: 'From Date',
				type: 'date',			
				onInput: console.log,
			},
			{
				name: 'toDate',
				label: 'To Date',
				type: 'date',			
				onInput: console.log,
			}
		]} />
</DialogPage>