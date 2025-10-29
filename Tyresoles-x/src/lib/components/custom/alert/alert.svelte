<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import Icon from '../icon/icon.svelte';
	import type { AlertProps } from '../types';
	let props: AlertProps = $props();
	let icon = props.icon ?? (props.type === 'destructive' ? 'CircleAlert' : undefined);
</script>

<Alert.Root variant={props.type} class={props.class}>
	{#if icon}
		<Icon name={icon} class="h-5 w-5" />
	{/if}
	<Alert.Title>{props.title}</Alert.Title>
	<Alert.Description>{props.description}</Alert.Description>
</Alert.Root>
