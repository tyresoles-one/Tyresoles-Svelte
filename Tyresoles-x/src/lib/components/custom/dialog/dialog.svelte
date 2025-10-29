<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { DialogProps } from '$lib/components/custom/types';
	import { dialogStore } from '$lib/managers/stores';
	import Icon from '../icon/icon.svelte';
</script>

<AlertDialog.Root bind:open={$dialogStore.open}>
	<AlertDialog.Trigger />
	<AlertDialog.Content>
		<AlertDialog.Header>
			<div class="flex gap-2">
				{#if $dialogStore.icon}
					<Icon name={$dialogStore.icon} />
				{/if}
				{#if $dialogStore.title}
					<AlertDialog.Title>{$dialogStore.title}</AlertDialog.Title>
				{/if}
			</div>

			{#if $dialogStore.description}
				<AlertDialog.Description>
					{$dialogStore.description}
				</AlertDialog.Description>
			{/if}
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={$dialogStore.onCancel}
				>{$dialogStore.cancelLabel}</AlertDialog.Cancel
			>
			<AlertDialog.Action onclick={$dialogStore.onAction}
				>{$dialogStore.actionLabel}</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
