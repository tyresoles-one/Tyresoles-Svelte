<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Label } from '$lib/components/ui/label';
	import { Icon } from '$lib/components/custom/icon';
	import { Button } from '$lib/components/custom/button';
	let { searchTerm = $bindable() }: { searchTerm: string } = $props();
</script>

<Sidebar.Group class="py-0">
	<Sidebar.GroupContent class="relative">
		<Label for="search" class="sr-only">Search</Label>
		<Sidebar.Input id="search" class="pl-8" placeholder="Search" bind:value={searchTerm} />
		<Icon
			name="Search"
			class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"
		/>
		{#if searchTerm}
			<Button
				variant="ghost"
				size="icon"
				class="absolute right-2 top-1/2 size-6 -translate-y-1/2"
				onclick={() => (searchTerm = '')}
			>
				<Icon name="X" />
			</Button>
		{/if}
	</Sidebar.GroupContent>
</Sidebar.Group>
