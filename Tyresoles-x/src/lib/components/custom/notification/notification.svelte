<script lang="ts">
	import { Icon } from '$lib/components/custom/icon';
	import { Button } from '$lib/components/custom/button';
	import { Badge } from '$lib/components/ui/badge';
	import { onMount } from 'svelte';
	import { prepareFirebase } from '$lib/managers/network';

	let { count }: { count: number } = $props();

	let permission = $state<'default' | 'granted' | 'denied'>('default');
	onMount(() => {
		permission = Notification.permission;
		if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
			prepareFirebase();
		}
	});
	const handleClick = () => {
		if (Notification.permission !== 'granted') {
			Notification.requestPermission().finally(() => {
				location.reload();
			});
		}
	};
</script>

<div class="relative">
	<Button onclick={handleClick} variant="ghost" size="icon">
		<Icon name={permission === 'granted' ? 'Bell' : 'BellOff'} class="size-5" />
	</Button>
	{#if count}
		<Badge variant="destructive" class="absolute right-0 m-0 px-1 text-[0.55rem] leading-none"
			>{count}</Badge
		>
	{/if}
</div>
