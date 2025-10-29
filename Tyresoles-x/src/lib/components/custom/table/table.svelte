<script lang="ts">
	import { orderBy } from 'lodash-es';
	import Header from './header.svelte';
	import { cn } from '$lib/utils';
	import type { TableColumn, TableProps } from '../types';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { calcAggregation } from '$lib/managers/services/object';
	import {
		extractColumns,
		getObjectValues,
		filter,
		filterMultiple,
		getVisibleColumnNames,
		extractObjectKeyColumnName,
		getSelectionForData,
		getSelectionForDataArray,
		pluckUnique
	} from '$lib/managers/services/object';
	import { onMount } from '$lib';
	import Input from '../input/input.svelte';
	let {
		type,
		data = $bindable([]),
		dataKey,
		columns,
		selectionType = 'single',
		value,
		enableSelection,
		onSelectionChange,
		id,
		onRowClick,
		enableSearch = true,
		hideHeader = false,
		searchTerm,
		class: className,
		footer
	}: TableProps = $props();

	let visibleColumns = $state<Set<TableColumn>>(new Set(columns));
	let filters = $state<
		Array<{
			column: string;
			value: string;
		}>
	>([]);
	let currentData = $state<Array<object>>([...data]);
	let selectedRows = $state<Set<string>>(new Set<string>());
	let currentFocus = $state<number>(0);
	let columnWidths = $state<Array<number>>([]);
	let tableElement: HTMLTableElement | null = null;
	enableSelection = enableSelection ?? (selectionType === 'multiple' || type === 'dropdown');
	let currentSort: { column: string; direction: 'desc' | 'asc' } | undefined = $state();
	onMount(() => {
		if (tableElement) {
			const columns = Array.from(tableElement.querySelectorAll('th'));
			columnWidths = columns.map((col) => col.offsetWidth);
		}
	});

	$effect(() => {
		currentData = filter(data, getVisibleColumnNames(visibleColumns), searchTerm ?? '');
		if (!dataKey) dataKey = extractObjectKeyColumnName(currentData);
	});

	$effect(() => {
		currentData = filterMultiple(data, filters);
	});

	$effect(() => {
		if (!columns) {
			columns = extractColumns(data);
		}
		visibleColumns = new Set(columns);
	});
	$effect(() => {
		selectedRows = getSelectionForData(data, value ?? '', dataKey ?? 'code');
	});
	$effect(() => {
		const selectedData = getSelectionForDataArray(data, selectedRows, dataKey ?? 'code');
		//onSelectionChange?.(selectedData);
	});

	const toggleSelectAll = (selected: boolean | 'indeterminate') => {
		if (selected) {
			selectedRows = new Set(currentData.map((row) => getObjectValues(row, dataKey ?? 'code')));
		} else {
			selectedRows = new Set();
		}
	};
	const isRowSelected = (row: object) => {
		const element = getObjectValues(row, dataKey ?? 'code');
		return selectedRows.has(element);
	};
	const isAllSelected = () => {
		return selectedRows.size === currentData.length;
	};
	const handleRowClick = (row: object) => {
		const element = getObjectValues(row, dataKey ?? 'code');
		const newSelectedRows = new Set<string>(selectionType === 'multiple' ? selectedRows : []);
		
		if (!newSelectedRows.has(element)) {
			newSelectedRows.add(element);			
		} else if (selectionType === 'single') {
			newSelectedRows.delete(element);			
		}
				
		selectedRows = newSelectedRows;
		onRowClick?.(row);
		const selectedData = getSelectionForDataArray(data, selectedRows, dataKey ?? 'code');		
		onSelectionChange?.(selectedData);
	};
	const onKeyDown = (event: KeyboardEvent) => {
		switch (event.code) {
			case 'ArrowDown':
				event.preventDefault();
				currentFocus = Math.min(currentFocus + 1, currentData.length - 1);
				document.getElementById(`row-${currentFocus}`)?.focus();
				break;

			case 'ArrowUp':
				event.preventDefault();
				if (currentFocus === 0) {
					document.getElementById(`search-${id}`)?.focus();
				} else {
					currentFocus = Math.max(currentFocus - 1, 0);
					document.getElementById(`row-${currentFocus}`)?.focus();
				}
				break;

			case 'Space':
			case 'Enter':
			case 'NumpadEnter':
				event.preventDefault();
				if (currentFocus >= 0 && currentFocus < currentData.length) {
					handleRowClick(currentData[currentFocus]);
				}
				break;
		}
	};
	const handleSort = (column: string, direction: 'desc' | 'asc') => {
		currentData = orderBy(data, column, direction);
		currentSort = { column, direction };
	};

	// Resizing logic remains the same as before
	let resizingIndex: number | null = null;
	let startX: number = 0;
	let startWidth: number = 0;

	function startResize(event: MouseEvent | TouchEvent, index: number) {
		resizingIndex = index;

		if (event instanceof MouseEvent) {
			startX = event.clientX;
		} else if (event instanceof TouchEvent) {
			startX = event.touches[0].clientX;
		}

		startWidth = columnWidths[index];

		window.addEventListener('mousemove', onResize);
		window.addEventListener('touchmove', onResize);
		window.addEventListener('mouseup', stopResize);
		window.addEventListener('touchend', stopResize);
	}

	function onResize(event: MouseEvent | TouchEvent) {
		if (resizingIndex !== null) {
			let currentX: number = 0;

			if (event instanceof MouseEvent) {
				currentX = event.clientX;
			} else if (event instanceof TouchEvent) {
				currentX = event.touches[0].clientX;
			}

			const delta = currentX - startX;
			columnWidths[resizingIndex] = Math.max(50, startWidth + delta); // Minimum width of 50px
		}
	}

	function stopResize() {
		resizingIndex = null;

		window.removeEventListener('mousemove', onResize);
		window.removeEventListener('touchmove', onResize);
		window.removeEventListener('mouseup', stopResize);
		window.removeEventListener('touchend', stopResize);
	}
	
</script>

<div
	tabindex="0"
	id={`table-${id}`}
	role="grid"
	onkeydown={(event) => onKeyDown(event)}
	class={cn(type === 'dropdown' ? 'h-36' : '', 'overflow-auto')}
>
	{#if type === 'table'}
		<div class="flex flex-row gap-2 overflow-y-auto px-1 pb-2">
			<Input icon="Search" placeholder="Search" bind:value={searchTerm} />
			{@render recordCount({ count: currentData.length, selected: selectedRows.size })}
		</div>
	{/if}

	<table bind:this={tableElement} class={cn('text-sm dark:bg-slate-800', className)}>
		{#if !hideHeader}
			<thead class="w-full bg-background [&_tr]:border-b">
				<tr
					class="flex w-full border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
				>
					{#if enableSelection}
						<th class={cn('p-2 text-center align-middle [&:has([role=checkbox])]:pr-0')}>
							<Checkbox
								disabled={selectionType === 'single'}
								checked={isAllSelected()}
								onCheckedChange={(checked) => {
									toggleSelectAll(checked);
								}}
							/>
						</th>
					{/if}

					{#each visibleColumns as column, index}
						{#if visibleColumns.has(column)}
							<Header
								{handleSort}
								{column}
								bind:filters
								{type}
								data={pluckUnique(data, column?.name)}
								onResize={startResize}
								{index}
								sortOrder={currentSort
									? currentSort.column === column.name
										? currentSort.direction
										: undefined
									: undefined}
							/>
						{/if}
					{/each}
				</tr>
			</thead>
		{/if}

		<tbody
			class={cn(
				'overflow-y-auto [&_tr:last-child]:border-0',
				type === 'dropdown' ? 'max-h-36' : ''
			)}
		>
			{#each currentData as row, index}
				<tr
					class="cursor-pointer border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
					class:bg-muted={currentFocus === index}
					class:selected={selectedRows.has(getObjectValues(row, dataKey ?? 'code'))}
					tabindex="0"
					id={`row-${index}`}
					onclick={() => {
						handleRowClick(row);
					}}
				>
					{#if enableSelection}
						<td
							class={cn('flex-shrink-0 p-2 text-center align-middle [&:has([role=checkbox])]:pr-0')}
						>
							<Checkbox
								disabled={selectionType === 'single'}
								tabindex={-1}
								checked={isRowSelected(row)}
								onCheckedChange={(checked) => {
									handleRowClick(row);
								}}
							/>
						</td>
					{/if}

					{#each visibleColumns as column}
						{#if visibleColumns.has(column)}
							<td
								class="w-full whitespace-nowrap p-2 text-center align-middle [&:has([role=checkbox])]:pr-0"
								>{row[column.name]}</td
							>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#snippet recordCount(props: { count: number; selected: number })}
	<div class="flex items-center justify-center gap-2 rounded-md bg-muted px-2">
		{#if selectionType === 'multiple' && props.selected > 0}
			<span class="text-sm font-semibold">{props.selected}</span>
			<Separator orientation="vertical" />
		{/if}

		<span class="text-sm font-semibold">{props.count}</span>
	</div>
{/snippet}
