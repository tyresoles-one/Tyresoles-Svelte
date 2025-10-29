<script lang="ts">
	import { Tile, TilesBoard, updateGoBackPath } from '$lib/components';
	import { endpoints, apiFetch } from '$lib/managers/network';
	import { fetchParamsStore, loadingStore } from '$lib/managers/stores';
	import { onMount, goto } from '$lib';
	import type { TileProps } from '$lib/components/custom/types';
	import { fetchMasters } from './logic';
	let tiles = $state<TileProps[]>([]);

	const fetchTiles = () => {
		apiFetch(endpoints.production.procTiles, {
			method: 'POST',
			body: {
				...$fetchParamsStore
			}
		}).then((resp) => {
			if (resp.success) tiles = resp.data;
			fetchMasters();
		});
	};
	const handleTileClick = (label: string) => {
		switch (label) {
			case 'Tyres Booking':
				goto('/ecoproc/orders');
				break;
			case 'Tyres Booked':
				goto('/ecoproc/posted');
				break;
			case 'Suppliers':
				goto('/ecoproc/vendors');
				break;
		}
	};
	onMount(() => {
		fetchTiles();
		updateGoBackPath('/');
	});
</script>

<TilesBoard {tiles} loading={$loadingStore} onTileClick={handleTileClick} onRefresh={fetchTiles} />

<!-- {#if tiles.length > 0}
	<div class="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
		{#each tiles as tile}
			<Tile
				icon={tile.icon}
				label={tile.label}
				description={tile.description}
				value={tile.value}
				onClick={() => handleTileClick(tile.label ?? '')}
			/>
		{/each}
	</div>
{:else}
	<TilesBoard />
{/if} -->
