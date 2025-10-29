<script lang="ts">
	import { fetchParamsStore, loadingStore, settingsStore } from '$lib/managers/stores';
	import { onMount, goto } from '$lib';
	import {
		Grid,
		type ButtonProps,
		Tabs,
		Form,
		type InputProps,
		toast,
		dialogShow,
		dialogHide,
		updateGoBackPath
	} from '$lib/components';
	import { apiFetch, endpoints } from '$lib/managers/network';
	import type { ShipmentInfo, OrderLineDispatch } from '$lib/business/models';
	import { TyreFactoriesActive } from '$lib/business';
	import { required, mobileNo, vehicleNo } from '$lib/managers/services/validation';

	let data = $state<Array<object>>([]);
	let activeTab = $state<string>('tyres');
	let selection: Map<string, object> = $state(new Map());
	let tyresTabLabel = $derived.by(() =>
		selection.size > 0
			? `${selection.size} Tyre${selection.size > 1 ? 's' : ''} selected`
			: 'Select Tyres'
	);
	let shipment = $state<ShipmentInfo>({
		no: '',
		date: new Date().toISOString().split('T')[0],
		vehicleNo: '',
		mobileNo: '',
		transport: '',
		destination: ''
	});

	const fetchTyres = () => {
		apiFetch(endpoints.production.procOrderLinesDispatch, {
			method: 'POST',
			body: {
				...$fetchParamsStore,
				View: 'Posted'
			}
		}).then((res) => {
			if (res.success) data = res.data;
		});
	};
	const actions: ButtonProps[] = [
		{
			icon: 'RefreshCw',
			label: 'Refresh',
			variant: 'outline',
			class: 'border-2',
			onclick: () => {
				fetchTyres();
			}
		},
		{
			icon: 'Trash2',
			label: 'Remove Casings',
			variant: 'destructive',
			class: 'border-2',
			onclick: () => {
				handleRemove();
			}
		}
	];
	const formActions: ButtonProps[] = [
		{
			icon: 'Plus',
			label: 'New Shipment',
			variant: 'outline',
			onclick: () => {
				apiFetch(endpoints.production.newProcShipNo, {
					method: 'POST',
					body: {
						...$fetchParamsStore,
						From: shipment.date
					}
				}).then((res) => {
					if (res.success) {
						shipment.no = res.data;
						fields[0].type = 'text';
						fields[0].label = 'Shipment No';
						fields[0].readonly = true;
					}
				});
			}
		},
		{
			icon: 'Pencil',
			label: 'Edit Shipment',
			variant: 'outline',
			onclick: () => {
				shipment.no = '';

				apiFetch(endpoints.production.procShipmentsForMerger, {
					method: 'POST',
					body: {
						...$fetchParamsStore
					}
				}).then((res) => {
					if (res.success) {
						fields[0].type = 'list';
						fields[0].label = 'Select Shipment No';
						fields[0].data = res.data;
						fields[0].dataKey = 'no';
						fields[0].labelKey = 'no';
						fields[0].columns = [{ name: 'no' }, { name: 'date' }];
						fields[0].hideHeader = true;
						fields[0].readonly = false;
						fields[0].onInput = (value, extra) => {
							const record = new Map(extra as Map<string, object>).get(value as string);
							if (record) {
								shipment.no = record?.no;
								shipment.date = record?.date;
								shipment.destination = record?.destination;
								shipment.transport = record?.transport;
								shipment.vehicleNo = record?.vehicleNo;
								shipment.mobileNo = record?.mobileNo;
							}
						};
					}
				});
			}
		},
		{
			type: 'submit',
			icon: 'Send',
			label: 'Post Shipment',
			variant: 'default',
			class: 'border-2'
		}
	];
	const fields = $state<InputProps[]>([
		{
			name: 'no',
			label: 'Shipment No',
			type: 'text',
			readonly: true,
			rules: [required('Shipment No')]
		},
		{
			name: 'destination',
			type: 'list',
			data: TyreFactoriesActive,
			dataKey: 'code',
			labelKey: 'name',
			columns: [{ name: 'name' }],
			label: 'Destination',
			hideHeader: true,
			rules: [required('Destination')]
		},
		{
			name: 'transport',
			label: 'Transport',
			rules: [required('Transport')]
		},
		{
			name: 'vehicleNo',
			label: 'Vehicle No',
			rules: [required('Vehicle No'), vehicleNo()]
		},
		{
			name: 'mobileNo',
			label: 'Mobile No',
			rules: [required('Mobile No'), mobileNo()]
		}
	]);
	onMount(() => {
		fetchTyres();
		updateGoBackPath('/ecoproc');
	});
	const handleSubmit = (data: Record<string, unknown>) => {
		if (selection.size === 0) {
			toast.error('No tyres selected.');
			return;
		}
		if (!shipment.no) {
			toast.error('Shipment No is required.');
			return;
		}
		dialogShow({
			title: 'Confirm Shipment',
			description: 'Are you sure you want to post this shipment?',
			actionLabel: 'Post',
			onAction: () => {
				dialogHide();
				let orderLines: OrderLineDispatch[] = [];
				for (const [key, value] of selection) {
					orderLines.push({
						button: '',
						date: '',
						dispatchDate: shipment.date,
						dispatchDestination: shipment.destination,
						dispatchMobileNo: shipment.mobileNo,
						dispatchOrderNo: shipment.no,
						dispatchTransporter: shipment.transport,
						dispatchVehicleNo: shipment.vehicleNo,
						factInspector: '',
						factInspection: '',
						factInspectorFinal: '',
						inspection: '',
						inspector: '',
						lineNo: value?.lineNo ?? 0,
						make: '',
						model: '',
						newSerialNo: '',
						orderNo: value?.orderNo ?? '',
						orderStatus: '',
						rejectionReason: '',
						remark: '',
						serialNo: '',
						no: '',
						supplier: '',
						location: '',
						sortNo: ''
					});
				}

				apiFetch(endpoints.production.updateProcOrdLinesDispatch, {
					method: 'POST',
					body: orderLines
				}).then((res) => {
					if (res.success) {
						toast.success('Shipment Posted Successfully.');
						goto('/ecoproc');
					}
				});
			}
		});
	};
	const handleRemove = () => {
		if (selection.size === 0) {
			toast.error('No tyres selected.');
			return;
		}
		dialogShow({
			title: 'Confirm Removal',
			description:
				'Are you sure you want to remove casings from selected tyres?, this action cannot be undone.',
			actionLabel: 'Remove',
			onAction: () => {
				dialogHide();
				let orderLines: OrderLineDispatch[] = [];
				for (const [key, value] of selection) {
					orderLines.push({
						button: '',
						date: '',
						dispatchDate: '',
						dispatchDestination: '',
						dispatchMobileNo: '',
						dispatchOrderNo: '',
						dispatchTransporter: '',
						dispatchVehicleNo: '',
						factInspector: '',
						factInspection: '',
						factInspectorFinal: '',
						inspection: '',
						inspector: '',
						lineNo: value?.lineNo ?? 0,
						make: '',
						model: '',
						newSerialNo: '',
						orderNo: value?.orderNo ?? '',
						orderStatus: '',
						rejectionReason: 'Casing Removed',
						remark: '',
						serialNo: '',
						no: '',
						supplier: '',
						location: '',
						sortNo: ''
					});
				}

				apiFetch(endpoints.production.updateProcOrdLinesDrop, {
					method: 'POST',
					body: orderLines
				}).then((res) => {
					if (res.success) {
						toast.success('Casings Removed Successfully.');
						fetchTyres();
					}
				});
			}
		});
		console.log('Remove Casings', selection);
	};
</script>

<Tabs.Root value={activeTab} class="w-full" disabled={$loadingStore}>
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="tyres">{tyresTabLabel}</Tabs.Trigger>
		<Tabs.Trigger value="vehicle">Transport Details</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="tyres">
		<Grid
			type="table"
			{data}
			{actions}
			loading={$loadingStore}
			enableSelection
			selectionType="multiple"
			dataKey="orderNo,lineNo"
			columns={[
				{
					name: 'sortNo',
					label: 'Sort No'
				},
				{
					name: 'no',
					label: 'Tyre Size',
					aggregation: 'count'
				},
				{
					name: 'make',
					label: 'Make'
				},
				{
					name: 'serialNo',
					label: 'Serial No'
				},
				{
					name: 'date',
					label: 'Date'
				},
				{
					name: 'supplier',
					label: 'Supplier'
				},
				{
					name: 'orderNo',
					label: 'Order No'
				}
			]}
			onSelectionChange={(sel) => {
				selection = sel;
			}}
		/>
	</Tabs.Content>

	<Tabs.Content value="vehicle">
		{#if shipment}
			<Form
				loading={$loadingStore}
				{fields}
				actions={formActions}
				bind:data={shipment}
				onSubmit={handleSubmit}
				layoutClass="flex flex-col sm:flex-col md:flex-row  gap-2"
			/>
		{/if}
	</Tabs.Content>
</Tabs.Root>
