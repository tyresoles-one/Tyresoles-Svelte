<script lang="ts">
	import { cn } from '$lib/utils';
	import Button from '../button/button.svelte';
	import Icon from '../icon/icon.svelte';
	import type { BannerProps } from '../types';
	let {
		type = 'default',
		title,
		description,
		icon,
		class: className,
		buttons = []
	} = $props<BannerProps>();
</script>

<div
	class={cn(
		'flex items-center gap-4 rounded-md border p-4',
		className,
		type === 'default' && 'border-slate-400',
		type === 'destructive' && 'border-red-600'
	)}
>
	{#if icon}
		<Icon name={icon} class="size-7 text-slate-500" />
	{/if}
	<div class="flex flex-1 flex-col gap-1">
		<div class="-mb-1 font-semibold italic">{title}</div>
		<div class="text-sm">{description}</div>
	</div>
	<div>
		{#each buttons as button}
			<Button {...button} />
		{/each}
	</div>
</div>
