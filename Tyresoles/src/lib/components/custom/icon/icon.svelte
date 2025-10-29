<script lang="ts">
	import * as icons from '@lucide/svelte';
	interface Props {
		name: string;
		class?: string;
	}
	let { name, class: className }: Props = $props();
	import { cn } from '$lib/utils';

	let IconComponent = $derived(name && icons[name] ? icons[name] : null);
</script>

{#if IconComponent}
	<IconComponent class={cn(className)} />
{:else}
	<p>I</p>
{/if}
