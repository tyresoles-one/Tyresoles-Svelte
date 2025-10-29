<script lang="ts">
	import {
		toast,
		//Form,
		type ButtonProps,
		type InputProps,
		dialogShow,
		dialogHide,
		updateGoBackPath
	} from '$lib/components';
	import Form from '$lib/components/custom/form/form.svelte';
	import { pageStore, onMount, goto, getStore } from '$lib';
	import { required, pattern } from '$lib/managers/services/validation';
	import {
		vendorStore,
		fetchParamsStore,
		loadingStore,
		statesStore,
		marketsStore
	} from '$lib/managers/stores';
	import type { Vendor, CodeName } from '$lib/business/models';
	import { apiFetch, endpoints, fetchBankDetails } from '$lib/managers/network';

	let vendor = $state<Vendor | null | undefined>(
		Array.from($vendorStore ?? []).find((l) => l.no === $pageStore.params.ID)
	);

	onMount(() => {
		updateGoBackPath(`/ecoproc/vendors`);
	});

	$effect(() => {
		if ($pageStore.params.ID) {
			vendor = Array.from($vendorStore ?? []).find((l) => l.no === $pageStore.params.ID);
		}
	});

	$inspect($statesStore, 'states');

	const fields: InputProps[] = [
		{
			name: 'no',
			label: 'Code',
			required: true,
			readonly: true,
			rules: [required('Code')]
		},
		{
			name: 'name',
			label: 'Name',
			required: true,
			hideHeader: true,
			rules: [required('Name')]
		},
		{
			name: 'address',
			label: 'Address',
			required: true,
			rules: [required('Address')]
		},
		{
			name: 'address2',
			label: 'Address Line 2'
		},
		{
			name: 'city',
			label: 'City',
			required: true,
			rules: [required('City')]
		},
		{
			name: 'stateCode',
			label: 'State',
			type: 'list',
			hideHeader: true,
			data: $statesStore ?? [],
			dataKey: 'code',
			labelKey: 'name',
			valueKey: 'code',
			selectionType: 'single',
			columns: [
				{ name: 'name', label: 'State' },
				{ name: 'code', label: 'Code' }
			],
			required: true,
			rules: [required('State')]
		},
		{
			name: 'detail',
			label: 'Market',
			type: 'list',
			data: $marketsStore ?? [],
			dataKey: 'code',
			labelKey: 'name',
			valueKey: 'code',
			selectionType: 'single',
			hideHeader: true,
			columns: [{ name: 'code', label: 'Market' }],
			required: true,
			rules: [required('Market')]
		},
		{
			name: 'mobileNo',
			label: 'Mobile No',
			required: true,
			rules: [required('Mobile No')]
		},
		{
			name: 'bankIFSC',
			label: 'Bank IFSC',
			required: true,
			rules: [required('Bank IFSC')],
			oninput: (e: Event) => {
				const ifsc = (e.target as HTMLInputElement).value;
				if (ifsc.length === 11) {
					fetchBankDetails(ifsc).then((res) => {
						if (typeof res === 'string') {
							toast.error(res);
						} else if (typeof res === 'object' && vendor) {
							vendor.bankName = res.BANK;
							vendor.bankBranch = res.BRANCH;
						}
					});
				} else if (ifsc.length === 0 && vendor) {
					vendor.bankName = '';
					vendor.bankBranch = '';
				}
			}
		},
		{
			name: 'bankName',
			label: 'Name of Bank',
			required: true,
			rules: [required('Name of Bank')]
		},
		{
			name: 'bankAccNo',
			label: 'Bank A/c No',
			required: true,
			rules: [required('Bank A/c No')]
		},

		{
			name: 'bankBranch',
			label: 'Bank Branch',
			required: true,
			rules: [required('Bank Branch')]
		},
		{
			name: 'panNo',
			label: 'PAN No',
			required: true,
			rules: [required('PAN No')]
		},
		{
			name: 'adhaarNo',
			label: 'Adhaar No',
			required: true,
			rules: [required('Adhaar No')]
		}
	];
	const actions: ButtonProps[] = [
		{
			label: 'Save',
			variant: 'default',
			class: 'border-2',
			type: 'submit'
		},
		{
			label: 'Cancel',
			variant: 'outline',
			onclick: () => {
				goto('/ecoproc/vendors');
			}
		}
	];
	const handleSubmit = (data: Record<string, unknown>) => {
		if (!vendor) return;
		dialogShow({
			title: 'Confirm Save',
			description: 'Are you sure you want to save this vendor?',
			actionLabel: 'Save',
			onAction: () => {
				dialogHide();
				apiFetch(endpoints.production.updateVendor, {
					method: 'POST',
					body: {
						...vendor
					}
				}).then((res) => {
					if (res.success) {
						toast.success('Vendor updated successfully.');
						goto('/ecoproc/vendors');
					}
				});
			}
		});
	};
</script>

<div>
	{#if vendor}
		<Form
			{fields}
			bind:data={vendor}
			{actions}
			onSubmit={handleSubmit}
			loading={$loadingStore}
			layoutClass="grid gap-2 md:grid-cols-3 sm:grid-cols-1 sm:overflow-y-auto sm:flex-1"
		/>
	{/if}
</div>
