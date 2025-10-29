<script lang="ts">
	import { type PartyGstin, type GSTINResponse } from '$lib/business/models';
	import { apiFetch, endpoints, getURLSearchParams } from '$lib/managers/network';
	import { loadingStore } from '$lib/managers/stores';
	import { Form, type ButtonProps, type InputProps, toast } from '$lib/components';
	import Card from './card.svelte';

	let data = $state<PartyGstin>({
		type: '',
		code: '',
		name: '',
		gstin: '',
		status: '',
		blockStatus: '',
		tradeName: '',
		legalName: ''
	});
	let cardData = $state<GSTINResponse>();
	const onSubmit = () => {
		if (data) {
			if (!data.type || !data.code) {
				toast.error('Please select party type and code');
				return;
			}
			if (!data.gstin || data.gstin.length < 15) {
				toast.error('Please enter valid GSTIN');
				return;
			}
			if (!cardData) {
				toast.error('Please verify GSTIN');
				return;
			}
			apiFetch(endpoints.accounts.gstinSave, {
				method: 'POST',
				body: {
					...data,
					type: data.type[0],
					status: cardData.status,
					blockStatus: cardData.blkStatus ?? 'U',
					tradeName: cardData.tradeName,
					legalName: cardData.legalName
				}
			}).then((res) => {
				if (res.success) {
					toast.success('GSTIN saved successfully');
					data = {
						...data,
						type: '',
						code: '',
						gstin: '',
						status: '',
						blockStatus: '',
						tradeName: '',
						legalName: '',
						name: ''
					};
					cardData = undefined;
				} else {
					toast.error('Failed to save GSTIN');
				}
			});
		}
	};

	const handleCode = () => {
		if (data) {
			cardData = undefined;
			if (!data.code || data.code.length < 5) {
				return;
			}
			if (data.code && data.code.length > 10 && !data.type) {
				toast.error('Please select party type');
				return;
			}
			apiFetch(
				`${endpoints.sales.custVendNameByCode}?${getURLSearchParams({ type: data.type, code: data.code }).toString()}`,
				{
					method: 'GET'
				}
			).then((res) => {
				if (res.success) {
					data.name = res.data;
				}
			});
		}
	};

	const handleGSTIN = () => {
		if (data) {
			cardData = undefined;
			if (!data.gstin || data.gstin.length < 15) {
				return;
			}
			apiFetch(
				`${endpoints.accounts.gstinVerify}?${getURLSearchParams({ gstin: data.gstin }).toString()}`,
				{
					method: 'GET'
				}
			).then((res) => {
				if (res.success) {
					cardData = res.data;
				}
			});
		}
	};
	const handleGSTINSync = () => {
		if (data) {
			cardData = undefined;
			if (!data.gstin || data.gstin.length < 15) {
				toast.error('Please enter a valid GSTIN');
				return;
			}
			apiFetch(
				`${endpoints.accounts.gstinSync}?${getURLSearchParams({ gstin: data.gstin }).toString()}`,
				{
					method: 'GET'
				}
			).then((res) => {
				if (res.success) {
					cardData = res.data;
				}
			});
		}
	};
	const fields: InputProps[] = [
		{
			name: 'type',
			label: 'Party Type',
			type: 'list',
			data: [{ name: 'Customer' }, { name: 'Vendor' }, { name: 'Transporter' }],
			dataKey: 'name',
			hideHeader: true,
			required: true
		},
		{
			name: 'code',
			label: 'Party Code',
			required: true,
			type: 'text',
			oninput: (e: Event) => {
				handleCode();
			}
		},
		{
			name: 'name',
			label: 'Name',
			readonly: true
		},
		{
			name: 'gstin',
			label: 'GSTIN',
			type: 'text',
			oninput: (e: Event) => {
				handleGSTIN();
			}
		}
	];
	const actions: ButtonProps[] = [
		{
			icon: 'Save',
			label: 'Save in ERP',
			type: 'submit',
			loading: $loadingStore
		},
		{
			icon: 'RefreshCw',
			label: 'Sync with CP',
			variant: 'outline',
			loading: $loadingStore,
			onclick: () => {
				handleGSTINSync();
			}
		}
	];
</script>

<Form
	{fields}
	{actions}
	{data}
	{onSubmit}
	loading={$loadingStore}
	layoutClass="p-2 grid gap-2 md:grid-cols-4 sm:grid-cols-1 sm:overflow-y-auto sm:flex-1"
/>
{#if cardData}
	<Card {...cardData} />
{/if}
