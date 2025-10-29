<script lang="ts">
	import * as Command from '$lib/components/ui/command';	
	import Table from './table.svelte';
	import type { TableProps } from '../types';
	let { type, id, searchTerm = '', enableSearch = true, hideHeader = false, ...restProps }: TableProps = $props();
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.code === 'ArrowDown') {
			document.getElementById(`table-${id}`)?.focus();
		}
	};
	// $inspect(searchTerm);
</script>

{#if type === 'dropdown'}
	<Command.Root>
		{#if enableSearch}
			<Command.Input id={`search-${id}`} bind:value={searchTerm} onkeydown={onKeyDown} />
		{/if}
		<div class="overflow-x-auto">
			<Table {id} {searchTerm} {enableSearch} {hideHeader} {...restProps} type="dropdown" />
		</div>
	</Command.Root>
{:else}
	<Table {id} {...restProps} type="table" />
{/if}
