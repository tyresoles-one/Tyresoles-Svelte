<script lang="ts">
	import { Tile } from '../tile';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Menu from '../dropdown-menu/menu.svelte';
	import Icon from '../icon/icon.svelte';
	import type { TilesBoardProps, Menu as MenuProps } from '$lib/components/custom/types';

	let { loading, onRefresh, tiles, onTileClick }: TilesBoardProps = $props();
	const skeletons = ['', '', '', ''];
	const menu: MenuProps = {
		items: [
			{
				icon: 'RefreshCcw',
				label: 'Reload',
				onClick: () => {
					onRefresh?.();
				}
			}
		]
	};
</script>

<div class="group relative">
	<div class="grid gap-3 rounded-md p-2 group-hover:border sm:grid-cols-3 md:grid-cols-4">
		{#if loading}
			{#each skeletons as skeleton}
				<Skeleton class="h-20 w-full" />
			{/each}
		{:else if tiles && tiles.length > 0}
			{#each tiles as tile}
				<Tile
					{...tile}
					onClick={() => {
						onTileClick?.(tile.label as string);
					}}
				/>
			{/each}
		{/if}
	</div>
	<div class="hidde absolute right-0 top-0 bg-transparent group-hover:block">
		<Menu {menu}>
			<Icon name="EllipsisVertical" class="hidden size-4 rounded-full group-hover:block" />
		</Menu>
	</div>
</div>
