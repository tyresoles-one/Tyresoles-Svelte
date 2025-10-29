<script lang="ts">
	import type { ButtonProps, Menu } from '../types';
	import { Button } from '$lib/components/ui/button';
	import { DropdownMenu } from '$lib/components/custom/dropdown-menu';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Icon from '../icon/icon.svelte';
	import { cn } from '$lib/utils';

	let {
		loading,
		icon,
		iconClass,
		children,
		disabled: disabledProp,
		label,
		menuItems,
		...restProps
	}: ButtonProps = $props();
	let disabled: boolean = $state(false);
	$effect(() => {
		disabled = disabledProp ? disabledProp : loading ? loading : false;
	});

	//$inspect(loading, 'loading');
</script>

<Button variant="default" {disabled} {...restProps}>
	{#if loading}
		<Icon name="LoaderCircle" class="mr-1 size-4 animate-spin" />
	{/if}
	{#if icon && !loading}
		<Icon name={icon} class={cn('ml-[-0.5rem]', iconClass, !label && '-mr-2')} />
	{/if}
	{#if label}
		<span class="-mr-1">{label}</span>
	{/if}
	{@render children?.()}
	{#if menuItems && menuItems.length}
		<Separator orientation="vertical" class="mx-1 bg-slate-200" />
		<DropdownMenu
			triggerClass="-mx-3 px-2"
			menu={{
				items: menuItems
			}}
			{disabled}
		>
			<Icon name="ChevronDown" class="size-4" />
		</DropdownMenu>
	{/if}
</Button>
