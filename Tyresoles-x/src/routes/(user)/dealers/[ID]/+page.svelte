<script lang="ts">
	import {
		toast,
		type ButtonProps,
		type InputProps,
		dialogShow,
		dialogHide,
		updateGoBackPath
	} from '$lib/components';
	import Form from '$lib/components/custom/form/form.svelte';
	import { ProgressBar } from '$lib/components/custom/progress-bar';
	import { pageStore, onMount, goto } from '$lib';
	import { required } from '$lib/managers/services/validation';
	import { loadingStore } from '$lib/managers/stores';
	import type { Dealer, CodeName } from '$lib/business/models';
	import { apiFetch, endpoints, fetchBankDetails, getURLSearchParams } from '$lib/managers/network';

	let dealer = $state<Dealer | null | undefined>();

	onMount(() => {
		updateGoBackPath(`/dealers`);

		if ($pageStore.params.ID) {
			apiFetch(
				`${endpoints.sales.getDealerRecord}?${getURLSearchParams({ code: $pageStore.params.ID }).toString()}`,
				{
					method: 'GET'
				}
			).then((res) => {
				if (res.success) {
					dealer = res.data;
				}
			});
		}
	});

	let fields = $state<InputProps[]>([
		{
			name: 'name',
			label: 'Name',
			required: true,
			hideHeader: true,
			rules: [required('Name')]
		},
		{
			name: 'dlrshipName',
			label: 'Dealership Name',
			required: true,
			rules: [required('Dealership Name')]
		},
		{
			name: 'product',
			label: 'Product',
			type: 'list',
			hideHeader: true,
			labelKey: 'code',
			valueKey: 'value',
			dataKey: 'value',
			output: 'number',
			columns: [{ name: 'code' }],
			data: [
				{ code: '', value: 0 },
				{ code: 'Ecomile', value: 1 },
				{ code: 'Retread', value: 2 }
			],
			rules: [required('Product')]
		},
		{
			name: 'busModel',
			label: 'Bus. Model',
			type: 'list',
			hideHeader: true,
			labelKey: 'code',
			valueKey: 'value',
			dataKey: 'value',
			output: 'number',
			columns: [{ name: 'code' }],
			data: [
				{ code: '', value: 0 },
				{ code: 'CPA-Ecomiles', value: 1 },
				{ code: 'CNC-Ecomiles', value: 2 },
				{ code: 'CNC-Ecomiles & Rtd', value: 3 },
				{ code: 'CNC-Rtd', value: 4 },
				{ code: 'CPA-Ecomiles & Rtd on demand', value: 5 }
			],
			rules: [required('Bus. Model')]
		},
		{
			name: 'email',
			label: 'Email'
		},
		{
			name: 'invAmt',
			label: 'Investment Amount',
			type: 'number'
		},
		{
			name: 'bkIfsc',
			label: 'Bank IFSC',
			required: true,
			rules: [required('Bank IFSC')],
			oninput: (e: Event) => {
				const ifsc = (e.target as HTMLInputElement).value;
				if (ifsc.length === 11) {
					fetchBankDetails(ifsc).then((res) => {
						if (typeof res === 'string') {
							toast.error(res);
						} else if (typeof res === 'object' && dealer) {
							dealer.bkName = res.BANK;
							dealer.bkBrch = res.BRANCH;
						}
					});
				} else if (ifsc.length === 0 && dealer) {
					dealer.bkName = '';
					dealer.bkBrch = '';
				}
			}
		},
		{
			name: 'bkName',
			label: 'Name of Bank',
			required: true,
			rules: [required('Name of Bank')]
		},
		{
			name: 'bkAcNo',
			label: 'Bank A/c No',
			required: true,
			rules: [required('Bank A/c No')]
		},
		{
			name: 'bkBrch',
			label: 'Bank Branch',
			required: true,
			rules: [required('Bank Branch')]
		},
		{
			name: 'pan',
			label: 'PAN No',
			required: true,
			rules: [required('PAN No')]
		},
		{
			name: 'adhar',
			label: 'Adhaar No',
			required: true,
			rules: [required('Adhaar No')]
		},
		{
			name: 'gst',
			label: 'GST No',
			oninput: (e: Event) => {
				const gst = (e.target as HTMLInputElement).value;
				console.log(gst, 'gst');
				if (gst.length === 15 && dealer) {
					const stateCode = parseInt(gst.substring(0, 2), 10);
					if (stateCode < 1 || stateCode > 37) {
						toast.error('Invalid GSTIN: State code is out of range.');
						return;
					}
					const panFromGst = gst.substring(2, 12);
					if (dealer.pan && dealer.pan !== panFromGst) {
						toast.error('PAN in GSTIN does not match the entered PAN.');
						return;
					}

					apiFetch(
						`${endpoints.accounts.gstinVerify}?${getURLSearchParams({ gstin: gst }).toString()}`,
						{
							method: 'GET'
						}
					).then((res) => {
						if (res.success) {
							fields.find((f) => f.name === 'gst')!.description = res.data.legalName;
						} else {
							fields.find((f) => f.name === 'gst')!.description = 'Invalid GSTIN';
							if (dealer) dealer.gst = '';
						}
					});
				} else {
					fields.find((f) => f.name === 'gst')!.description = '';
				}
			},

			onInput: (value: unknown) => {
				if (value === '' || value === null || value === undefined)
					fields.find((f) => f.name === 'gst')!.description = '';
			}
		},
		{
			name: 'doB',
			label: 'Date of Birth',
			type: 'date',
			output: 'date',
			format: 'dd-MMM-yy',
			yearsOnCalendar: 80
		},
		{
			name: 'doA',
			label: 'Date of Anniversary',
			type: 'date',
			output: 'date',
			format: 'dd-MMM-yy',
			yearsOnCalendar: 80
		},
		{
			name: 'doJ',
			label: 'Date of Joining',
			type: 'date',
			output: 'date',
			format: 'dd-MMM-yy'
		},
		{
			name: 'doE',
			label: 'Ending Date',
			type: 'date',
			output: 'date',
			format: 'dd-MMM-yy',
			yearsOnCalendarFuture: 5
		},
		{
			name: 'brdShop',
			label: 'Branded Shop',
			type: 'list',
			hideHeader: true,
			labelKey: 'code',
			valueKey: 'value',
			dataKey: 'value',
			output: 'number',
			columns: [{ name: 'code' }],
			data: [
				{ code: 'No', value: 0 },
				{ code: 'Yes', value: 1 }
			]
		}
	]);
	const actions: ButtonProps[] = [
		{
			label: 'Save',
			variant: 'default',
			class: 'border-2',
			type: 'submit'
		},
		{
			label: 'Upload Documents',
			variant: 'default',
			class: 'border-2',
			type: 'button',
			onclick: () => {
				if (!dealer) return;
				if (!dealer.dealerCode) {
					toast.error('Dealer code is required to upload documents.');
					return;
				}
				goto(`/dealers/${dealer.customerNo}/documents`);
			}
		},
		{
			label: 'Cancel',
			variant: 'outline',
			onclick: () => {
				goto('/dealers');
			}
		}
	];
	const handleSubmit = (data: Record<string, unknown>) => {
		if (!dealer) return;
		dialogShow({
			title: 'Confirm Save',
			description: 'Are you sure you want to save this dealer?',
			actionLabel: 'Save',
			onAction: () => {
				dialogHide();
				if (dealer?.gst && dealer.gst === null) dealer.gst = '';
				apiFetch(endpoints.sales.updateDealerRecord, {
					method: 'POST',
					body: {
						...dealer
					}
				}).then((res) => {
					if (res.success) {
						toast.success('Dealer record updated successfully.');
						goto('/dealers');
					}
				});
			}
		});
	};
</script>

<div>
	{#if dealer}
		<Form
			{fields}
			bind:data={dealer}
			{actions}
			onSubmit={handleSubmit}
			loading={$loadingStore}
			layoutClass="grid gap-2 md:grid-cols-3 sm:grid-cols-1 sm:overflow-y-auto sm:flex-1 p-2"
		/>
	{:else}
		<ProgressBar />
	{/if}
</div>
