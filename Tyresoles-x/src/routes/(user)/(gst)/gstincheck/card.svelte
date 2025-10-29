<script lang="ts">
	import type { GSTINResponse } from '$lib/business/models/accounts';
	let props: GSTINResponse = $props();
	const gstStatus = (status: string): string => {
		switch (status) {
			case 'ACT':
				return 'Active';
			case 'CNL':
				return 'Cancelled';
			case 'INA':
				return 'Inactive';
			case 'PRO':
				return 'Provision';
			default:
				return status;
		}
	};
	const sanitizeData = (input: unknown): string => {
		if (typeof input === 'string') {
			return input;
		}
		return '';
	};
</script>

{#if props}
	<div class="rounded-sm bg-slate-50 p-2">
		{@render lableValue('Trade Name', props.tradeName)}
		{@render lableValue('Legal Name', props.legalName)}
		{@render lableValue(
			'Address',
			`${sanitizeData(props.addrBno)} ${sanitizeData(props.addrBnm)} ${sanitizeData(props.addrSt)} ${sanitizeData(
				props.addrLoc
			)} ${sanitizeData(props.addrPncd)}`
		)}
		{@render lableValue('Date of Reg', props.dtReg)}
		{@render lableValue('Status', gstStatus(props.status))}
		{@render lableValue('BlockStatus', props.blkStatus === 'B' ? 'Blocked' : 'Unblocked')}
		{#if props.dtDReg}
			{@render lableValue('Date of De-Reg', props.dtDReg)}
		{/if}
	</div>
{/if}

{#snippet lableValue(label: string, value: string)}
	{#if value}
		<div class="m-1 flex flex-row justify-between rounded-sm bg-slate-200 py-1 pl-2 pr-1">
			<span class="w-1/3">{label}</span>
			<span class="flex-1 rounded-sm bg-white pl-2">{value}</span>
		</div>
	{/if}
{/snippet}
