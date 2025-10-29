<script lang="ts">
	import { Grid, DialogPage, Form, ReportViewer, toast, type ButtonProps } from '$lib/components';
	import { fetchParamsStore, loadingStore, tempFetchParamsStore } from '$lib/managers/stores';
	import type { FetchParams, PostedSalesDocument } from '$lib/business/models';
	import { apiFetch, endpoints } from '$lib/managers/network';
	import { onMount } from 'svelte';
	import { goto } from '$lib';

	let filter = $state<FetchParams>({
		...$fetchParamsStore,
		from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
		to: new Date().toISOString().split('T')[0],
		respCenters: [$fetchParamsStore?.respCenters?.[0]],
		view: 'Invoice', // Default view set to 'Invoice',
		reportName: 'Posted Sales Invoice'
	} as FetchParams);
	let salesDocs = $state<PostedSalesDocument[]>([]);
	let selection: Map<string, object> = $state(new Map());
	let openFilter = $state<boolean>(false);

	const actions: ButtonProps[] = [
		{
			label: 'Filter',
			icon: 'Filter',
			onclick: () => {
				openFilter = !openFilter;
			},
			variant: 'outline'
		},
		{
			label: 'Print',
			icon: 'Printer',
			onclick: () => {
				if (filter.nos && filter.nos.length > 0) {
					if (filter.reportName === 'Posted Claim Form' && filter.nos.length > 1) {
						toast.error('You can only print one Claim Form at a time.');
						return;
					}
					goto(`/salesdocs/print/`);
				} else {
					toast.error('Please select at least one document to print.');
				}
			},
			variant: 'outline'
		}
	];

	const fetchSalesDocs = () => {
		apiFetch(endpoints.sales.postedSalesDocuments, {
			method: 'POST',
			body: filter
		})
			.then((response) => {
				if (response && response.data) {
					salesDocs = response.data as PostedSalesDocument[];
				} else {
					salesDocs = [];
				}
			})
			.catch((error) => {
				console.error('Error fetching sales documents:', error);
			});
	};

	onMount(() => {
		fetchSalesDocs();
	});
	$effect(() => {
		// Update fetchParamsStore with the current filter
		filter.nos = Array.from(selection.keys());
	});

	$effect(() => {
		tempFetchParamsStore.set({
			...filter
		});
	});
</script>

<Grid
	type="table"
	data={salesDocs}
	{actions}
	loading={$loadingStore}
	enableSelection
	selectionType="multiple"
	dataKey="no"
	columns={[
		{ name: 'no', label: 'Document No.', aggregation: 'count' },
		{ name: 'date', label: 'Date' },
		{ name: 'customerNo', label: 'Customer Code' },
		{ name: 'customerName', label: 'Name' },
		{
			name: 'amount',
			label: 'Amount',
			textAlign: 'right',
			aggregation: 'sum',
			formatter: (v) => (v === 0 ? '' : Number.parseFloat(v).toLocaleString('en-US'))
		},
		{ name: 'qty', label: 'Qty' }
	]}
	onSelectionChange={(sel) => {
		selection = sel;
	}}
/>

<DialogPage
	open={openFilter}
	onOpenChange={(o) => (openFilter = o)}
	title="Filter Sales Documents"
	description="Use the filter options to narrow down the sales documents."
	actionLabel="Apply Filter"
	onAction={() => {
		openFilter = false;
		fetchSalesDocs();
	}}
>
	<Form
		bind:data={filter}
		fields={[
			{ name: 'from', label: 'From Date', type: 'date' },
			{ name: 'to', label: 'To Date', type: 'date' },
			{
				name: 'view',
				label: 'View',
				type: 'list',
				data: [
					{ code: 'Invoice', label: 'Invoices' },
					{ code: 'CrNote', label: 'Credit Notes' },
					{ code: 'Claim', label: 'Claim Forms' }
				],
				columns: [{ name: 'label', label: 'Label' }],
				hideHeader: true,
				dataKey: 'code',
				valueKey: 'code',
				labelKey: 'label',
				onselectionchange: (v: Event) => {
					switch (v?.target?.value) {
						case 'Invoice':
							filter.reportName = 'Posted Sales Invoice';
							break;
						case 'CrNote':
							filter.reportName = 'Posted Sales CreditMemo';
							break;
						case 'Claim':
							filter.reportName = 'Posted Claim Form';
							break;
					}
				}
			}
		]}
	/>
</DialogPage>
