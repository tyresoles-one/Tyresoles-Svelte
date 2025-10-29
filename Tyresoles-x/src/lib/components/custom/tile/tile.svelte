<script lang="ts">
	import { Icon } from '$lib/components/custom/icon';
	import type { TileProps } from '$lib/components/custom/types';
	import { cn } from '$lib/utils';

	let { icon, label, description, onClick, indicator, value }: TileProps = $props();
	let valueArray = $derived.by(() => {
		return value?.toFixed(2).split('.');
	});
	let indicatorIcon = $derived.by(() => {
		switch (indicator) {
			case 'positive':
				return 'MoveUp';
			case 'negative':
				return 'MoveDown';
			case 'neutral':
				return 'MoveVertical';
			default:
				return 'Dot';
		}
	});
</script>

<button
	onclick={onClick}
	class="flex w-auto flex-row items-center justify-center rounded-sm border border-b-2 border-r-4 border-slate-500 px-2 py-1 font-sans text-slate-400 hover:bg-muted/100"
>
	{#if icon}
		<Icon name={icon} class={cn('mr-2 size-4')} />
	{/if}
	<div class="flex flex-1 flex-col items-start gap-1">
		<span class="-mb-1 text-sm capitalize">{label}</span>
		<div class="flex items-center justify-center">
			<div class="flex items-baseline">
				<span class="text-2xl font-bold text-foreground"
					>{Number.parseInt(valueArray?.[0] ?? '0').toLocaleString()}</span
				>
				{#if valueArray?.[1] && Number.parseInt(valueArray?.[1]) > 0}
					<span class="text-sm text-foreground"> . {valueArray?.[1]}</span>
				{/if}
			</div>

			{#if indicator}
				<Icon
					name={indicatorIcon}
					class={cn(
						'size-4',
						indicator === 'positive' && 'text-green-500',
						indicator === 'negative' && 'text-red-500',
						indicator === 'neutral' && 'text-slate-400'
					)}
				/>
			{/if}
		</div>
		<span class="mt-0 text-sm">{description}</span>
	</div>
</button>
