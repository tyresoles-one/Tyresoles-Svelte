<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { DialogPageProps } from '../types';
	import { Icon } from '$lib/components/custom/icon';
	import { Button } from '$lib/components/custom/button';
	
	let {
		open,
		title,
		icon,
		description,
		actionLabel,
		loading,
		footer = true,
		onOpenChange,
		onAction,
		onClose,
		children,
		onEscapeKeydown,
		onInteractOutside,
		onFocusOutside,
		interactOutsideBehavior,
		escapeKeydownBehavior,
	}: DialogPageProps = $props();
</script>

<Dialog.Root {open} {onOpenChange} >
	<Dialog.Content {interactOutsideBehavior} {escapeKeydownBehavior} {onEscapeKeydown} {onInteractOutside} {onFocusOutside} class="p-2">
		<Dialog.Header >
			<div class="flex items-center gap-1">
				{#if icon}
					<Icon name={icon} class="h-5 w-5" />
				{/if}
				{#if title}
					<Dialog.Title>{title}</Dialog.Title>
				{/if}
			</div>

			{#if description}
				<Dialog.Description>{description}</Dialog.Description>
			{/if}
			
		</Dialog.Header>
		{@render children?.()}
		{#if footer}
			<Dialog.Footer>
				<Button {loading} onclick={onAction}>{actionLabel}</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
