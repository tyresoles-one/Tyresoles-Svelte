<script lang="ts">
	import { onMount, goto } from '$lib';
	import { Grid, type TableColumn, type ButtonProps } from '$lib/components';
	import { apiFetch, endpoints } from '$lib/managers/network';
	import {
		loadingStore,
		vehicleStore,
		fetchParamsStore,
		settingsStore
	} from '$lib/managers/stores';
	import type { Vehicle } from '$lib/business/models';

	let data = $state<Vehicle[]>([]);

	const columns: TableColumn[] = [
		{ label: 'No', name: 'no', aggregation: 'count' },
		{ label: 'Name', name: 'name', textAlign: 'left' },
		{ label: 'GST No', name: 'gstin', textAlign: 'left' },
		{
			label: 'Mobile No',
			name: 'mobileNo'
		},
		{ label: 'Status', name: 'status' }
	];

	let actions = $state<ButtonProps[]>([
		{
			icon: 'Plus',
			label: 'New',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				let vehicles = $vehicleStore ?? [];
				const idx = vehicles.findIndex((v) => v.lineNo === 0);
				if (idx < 0) {
					vehicles.push({
						gstin: '',
						name: '',
						no: '',
						mobileNo: '',
						lineNo: 0,
						respCenter: $fetchParamsStore?.respCenters?.[0] ?? '',
						status: ''
					});
					vehicleStore.set(vehicles);
				}
				setTimeout(() => {
					goto(`/vehmaster/0`);
				}, 500);
			}
		},
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				getVehicles();
			}
		}
	]);

	const getVehicles = () => {
		apiFetch(endpoints.sales.vehicles, {
			method: 'POST',
			body: {
				...$fetchParamsStore
			}
		}).then((res) => {
			if (res?.success) vehicleStore.set(res.data);
		});
	};

	onMount(() => {
		getVehicles();
	});
</script>

<Grid
	data={$vehicleStore ?? []}
	{columns}
	{actions}
	loading={$loadingStore}
	footer
	onRowClick={(row) => {
		settingsStore.update((s) => ({
			...s,
			activePage: `Vehicle No. ${row?.no}`
		}));
		goto(`/vehmaster/${row?.lineNo}`);
	}}
/>
