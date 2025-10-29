<script lang="ts">
	import { addRoute, routeHistory, goBack } from './route-history';
	import { Button } from '$lib/components/custom/button';
	import Icon from '../icon/icon.svelte';
	import { pageStore } from '$lib';
	$effect(() => {
		addRoute($pageStore.url.pathname);
	});

	$inspect($routeHistory);
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={() => {
		goBack($pageStore.url.pathname);
	}}
>
	<Icon name="Undo2" class="size-4" />
</Button>
