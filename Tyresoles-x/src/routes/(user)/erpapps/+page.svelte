<script lang="ts">
	import { Command } from '@tauri-apps/plugin-shell';
	import { toast, Button } from '$lib/components';
	import { userStore } from '$lib/managers/stores';

	const handleClick = async (args: Array<string>) => {
		try {
			const command = Command.create('run_nav', args);
			await command.execute();
		} catch (e) {
			toast.error('Error executing tauri command ' + e);
		}
	};
</script>

<div class="flex gap-2 p-4">
	{#if $userStore && $userStore.navSettings?.length > 0}
		{#each $userStore.navSettings as nav}
			<Button icon="AppWindow" onclick={() => handleClick([nav.settings])}
				><span class="ml-2">{nav.label}</span>
			</Button>
		{/each}
	{/if}
</div>
