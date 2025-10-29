<script lang="ts">
	import { Button, Input, toast } from '$lib/components';
	import { loadingStore } from '$lib/managers/stores';
	import { apiFetch, endpoints, getURLSearchParams } from '$lib/managers/network';

	let invNo = $state('');

	const runEWBProcess = () => {
		apiFetch(endpoints.accounts.runEWBProcess, {
			method: 'POST'
		});
	};
	const runEInvProcess = () => {
		apiFetch(endpoints.accounts.runEInvProcess, {
			method: 'POST'
		});
	};

	const handleGetEWB = () => {
		if (!invNo) {
			toast.error('Please enter an invoice number.');
			return;
		}
		apiFetch(`${endpoints.accounts.getEwbByInv}?${getURLSearchParams({ invNo }).toString()}`, {
			method: 'GET'
		}).then((resp) => {
			if (!resp.success) {
				console.log(resp);
				toast.error('Something went wrong.');
			}
		});
	};
</script>

<div class="flex flex-col gap-3 p-3">
	<div class="flex w-full flex-row gap-2 rounded-md border border-gray-300 p-3">
		<Button icon="RefreshCw" loading={$loadingStore} onclick={runEInvProcess}
			><span class="px-3">Generate E-Invoices</span></Button
		>
		<Button icon="RefreshCw" loading={$loadingStore} onclick={runEWBProcess}
			><span class="px-3">Generate E-Way Bills</span></Button
		>
	</div>
	<div class="flex flex-col gap-2 rounded-md border border-gray-300 p-3">
		<Input
			label="Get EWB By Invoice No."
			value={invNo}
			onchange={(e) => (invNo = e.target?.value)}
		/>
		<Button icon="File" variant="secondary" loading={$loadingStore} onclick={handleGetEWB}
			><span class="px-3">Get EWB</span></Button
		>
	</div>
</div>
