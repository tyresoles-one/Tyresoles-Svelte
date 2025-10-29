<script lang="ts">
	import {
		toast,
		dialogShow,
		dialogHide,
		updateGoBackPath,
		type ButtonProps,
		type InputProps
	} from '$lib/components';
	import { vehicleStore, loadingStore, fetchParamsStore } from '$lib/managers/stores';
	import { pageStore, onMount, goto, getStore } from '$lib';
	import { apiFetch, endpoints } from '$lib/managers/network';
	import type { Vehicle } from '$lib/business/models';
	import { required, pattern } from '$lib/managers/services/validation';
	import Form from '$lib/components/custom/form/form.svelte';

	let vehicle = $state<Vehicle | null | undefined>(
		Array.from($vehicleStore ?? []).find((l) => l.lineNo === parseInt($pageStore.params.ID))
	);
	const fields: InputProps[] = [
		{
			name: 'no',
			label: 'Vehicle No',
			required: true,
			rules: [required('Vehicle No')]
		},
		{
			name: 'name',
			label: 'Name',
			required: true,
			hideHeader: true,
			rules: [required('Name')]
		},
		{
			name: 'mobileNo',
			label: 'Mobile No'
		},
		{
			name: 'status',
			label: 'Status',
			type: 'list',
			data: [{ name: 'Active' }, { name: 'In Active' }],
			dataKey: 'name',
			hideHeader: true
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
				goto('/vehmaster');
			}
		}
	];
	onMount(() => {
		updateGoBackPath(`/vehmaster`);
	});
	const onSubmit = (data: Record<string, unknown>) => {
		apiFetch(endpoints.sales.updateVehicle, {
			method: 'POST',
			body: {
				...data
			}
		}).then((res) => {
			if (res?.success) {
				toast.success('Vehicle updated successfully');
				goto(`/vehmaster`);
			}
		});
	};
</script>

<div>
	{#if vehicle}
		<Form
			{fields}
			bind:data={vehicle}
			{actions}
			{onSubmit}
			loading={$loadingStore}
			class="h-screen"
			layoutClass="grid gap-2 md:grid-cols-3 sm:grid-cols-1 sm:overflow-y-auto sm:flex-1 p-2"
		/>
	{/if}
</div>
