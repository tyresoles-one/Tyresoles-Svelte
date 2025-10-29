<script lang="ts">
	import type { ButtonProps } from '../types';
	import { ProgressBar } from '../progress-bar';
	import { Button } from '$lib/components';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		children,
		class: className,
		loading,
		actions
	}: {
		children: Snippet;
		class?: string;
		loading?: boolean;
		actions?: Array<ButtonProps>;
	} = $props();
</script>

<div class={cn('flex h-auto w-full flex-col p-1', className)}>
	{#if loading}
		<ProgressBar />
	{/if}
	{#if actions}
		<div class="flex w-full gap-1 overflow-x-auto">
			{#each actions as action}
				<Button {...action} disabled={loading} />
			{/each}
		</div>
	{/if}
	{@render children?.()}
</div>
