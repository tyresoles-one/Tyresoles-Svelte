<script lang="ts">
	import { onMount, goto } from '$lib';
	import { Grid, updateGoBackPath } from '$lib/components';
	import { TyreFactoriesActive } from '$lib/business';
	import { fetchVendors, fetchStatesAndMarkets } from '../logic';
	import { vendorStore, loadingStore, settingsStore, fetchParamsStore } from '$lib/managers/stores';
	import type { TableColumn, ButtonProps } from '$lib/components/custom/types';
	import { apiFetch, endpoints } from '$lib/managers/network';

	let view = $state<'Non Zero' | 'Debit' | 'Credit' | ''>('Non Zero');

	const columns: TableColumn[] = [
		{ label: 'Code', name: 'no', aggregation: 'count' },
		{ label: 'Name', name: 'name', textAlign: 'left' },
		{ label: 'City', name: 'city', textAlign: 'left' },
		{
			label: 'Mobile No',
			name: 'mobileNo'
		},
		{
			label: 'Balance',
			name: 'balance',
			textAlign: 'right',
			aggregation: 'sum',
			formatter: (v) => (v === 0 ? '' : Number.parseFloat(v).toLocaleString('en-US'))
		}
	];

	let actions = $state<ButtonProps[]>([
		{
			icon: 'Plus',
			label: 'New',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				newVendor($fetchParamsStore?.respCenters[0]);
			}
		},
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			menuItems: [
				{
					label: 'Non Zero',
					icon: 'Diff',
					onClick: () => {
						view = 'Non Zero';
						getVendors();
					}
				},
				{
					label: 'Only Debit',
					icon: 'Plus',
					onClick: () => {
						view = 'Debit';
						getVendors();
					}
				},
				{
					label: 'Only Credit',
					icon: 'Minus',
					onClick: () => {
						view = 'Credit';
						getVendors();
					}
				},
				{
					label: 'ShowAll',
					icon: 'CheckCheck',
					onClick: () => {
						view = '';
						getVendors();
					}
				}
			],
			onclick: () => {
				getVendors();
			}
		},
		{
			icon: 'FileDown',
			label: 'Get Masters',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				fetchStatesAndMarkets();
			}
		}
	]);

	onMount(() => {
		getVendors();
		fetchStatesAndMarkets();
		updateGoBackPath('/ecoproc');
		if ($fetchParamsStore && $fetchParamsStore?.respCenters?.length > 0) {
			const respCenters = TyreFactoriesActive.filter((el) => {
				return $fetchParamsStore?.respCenters?.includes(el.code);
			});
			if (respCenters?.length > 1) {
				const newActions: ButtonProps[] = [
					{
						label: 'New',
						icon: 'Plus',
						variant: 'outline',
						class: 'border-2',
						onclick: () => {},
						menuItems: [
							...respCenters.map((el) => ({
								label: el.name,
								icon: 'UserPlus',
								onClick: () => {
									newVendor(el.code);
								}
							}))
						]
					},
					...actions.filter((a) => a.label !== 'New')
				];
				actions = newActions;
			}
		}
	});
	const getVendors = () => {
		fetchVendors(view).then((res) => {
			if (res?.success) vendorStore.set(res?.data);
		});
	};
	const newVendor = (respCenter = 'BEL') => {
		apiFetch(endpoints.production.createVendor, {
			method: 'POST',
			body: {
				...$fetchParamsStore,
				respCenters: [respCenter]
			}
		}).then((res) => {
			if (res.success) {
				fetchVendors('').then((resp) => {
					if (resp?.success) {
						vendorStore.set(resp?.data);
						settingsStore.update((s) => ({
							...s,
							activePage: `Vendor No. ${res?.data}`
						}));
						goto(`/ecoproc/vendors/${res.data}`);
					}
				});
			}
		});
	};
</script>

<Grid
	data={$vendorStore ?? []}
	{columns}
	{actions}
	loading={$loadingStore}
	footer
	onRowClick={(row) => {
		settingsStore.update((s) => ({
			...s,
			activePage: `Vendor No. ${row?.no}`
		}));
		goto(`/ecoproc/vendors/${row?.no}`);
	}}
/>
