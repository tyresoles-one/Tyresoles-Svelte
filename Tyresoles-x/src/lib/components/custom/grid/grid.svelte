<script lang="ts">
	import type { TableProps, TableColumn, Menu, InputProps } from '../types';
	import { cn } from '$lib/utils';
	import { orderBy } from 'lodash-es';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Button from '../button/button.svelte';
	import Input from '../input/input.svelte';
	import Icon from '../icon/icon.svelte';
	import Progressbar from '../progress-bar/progressbar.svelte';
	import { DropdownMenu } from '../dropdown-menu';
	import Header from './header.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { getSafeBottomPadding } from '$lib/managers/services/util';
	import { onMount } from 'svelte';
	import { Filter } from '../fech-param-filter';
	import { toast } from 'svelte-sonner';
	import {
		pluckUnique,
		filter,
		filterMultiple,
		getVisibleColumnNames,
		calcAggregation,
		updateArray,
		getObjectValues,
		extractColumns
	} from '$lib/managers/services/object';
	let {
		data,
		columns,
		actions,
		loading,
		dataKey,
		selectionType = 'single',
		enableSelection,
		onRowClick,
		onSelectionChange,
		type,
		hideHeader,
		selectedValues = $bindable(new Set<string>()),
		inLineActions,
		enableFilter,
		filterFields,
		filterData = $bindable({})
	}: TableProps = $props();

	let currentData = $state<Array<object>>(data);
	let visibleColumns = $state<Set<TableColumn>>(new Set(columns));
	const columnsMenu: Menu = {
		label: 'Hide & Show Columns',
		items: Array.from(columns ?? []).map((column) => ({
			label: column.label,
			checkBox: true,
			checked: visibleColumns.has(column),
			onCheckedChange: () => {
				const newColumns = updateArray(Array.from(visibleColumns), column, columns);
				visibleColumns = new Set(newColumns);
			}
		}))
	};
	let mode = $state<'Edit' | 'Select'>('Edit');
	let rowsSelected = $state<Map<string, object>>(new Map());
	let isAllSelected = $state<boolean>(false); //$derived(selectedValues.size === currentData.length);
	const isSelectable = $derived(
		enableSelection && (typeof onRowClick !== 'function' || mode === 'Select')
	);

	const toggleSelectAll = (checked: boolean) => {
		//if (selectedValues.size === currentData.length) {
		if (!checked) {
			if (!isFilter) selectedValues = new Set<string>();
		} else {
			let newSelectedValues = new Set<string>(selectedValues);
			currentData.forEach((row) => {
				var element = getObjectValues(row, dataKey ?? 'code');
				newSelectedValues.add(element);
			});
			selectedValues = newSelectedValues;
		}
		prepareSelection();
	};
	let currentSort: { column: string; direction: 'desc' | 'asc' } | undefined = $state();
	let searchTerm = $state<string>();
	let filters = $state<
		Array<{
			column: string;
			value: string;
		}>
	>([]);

	let prevFilters = $state<
		Array<{
			column: string;
			value: string;
		}>
	>([]);

	const isFilter = $derived<boolean>(
		filters.length > 0 || (searchTerm !== '' && searchTerm !== undefined)
	);

	let searchInput: HTMLInputElement;
	let tableBody: HTMLTableSectionElement;
	let focusedRowIndex = $state<number>(-1);
	let rows: HTMLTableRowElement[] = [];
	let gridMainHeight = $state<string>('auto');

	const handleKeyDown = (event: KeyboardEvent) => {
		if (!currentData.length) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				if (focusedRowIndex < currentData.length - 1) {
					focusedRowIndex++;
					rows[focusedRowIndex]?.focus();
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				console.log(focusedRowIndex, 'focusedRowIndex');
				if (focusedRowIndex > 0) {
					focusedRowIndex--;
					rows[focusedRowIndex]?.focus();
				} else {
					console.log(searchInput, 'searchInput');
					searchInput?.focus();
				}
				break;
			case 'Enter':
				event.preventDefault();
				if (focusedRowIndex >= 0) {
					handleRowClick(currentData[focusedRowIndex]);
				}
				break;
		}
	};

	$effect(() => {
		const filterJson = JSON.stringify(filters);
		const prevFilterJson = JSON.stringify(prevFilters);
		if (filterJson !== prevFilterJson) {
			isAllSelected = false;
			prevFilters = [...filters];
		}
	});

	$effect.pre(() => {
		if (!columns) {
			columns = extractColumns(data);
			visibleColumns = new Set(columns);
		}
		currentData = filter(data, getVisibleColumnNames(visibleColumns), searchTerm ?? '');
	});
	$effect(() => {
		currentData = filterMultiple(data, filters);
	});
	const getValue = (row: object, column: TableColumn, footer: boolean = false) => {
		if (row && column && column.name) {
			const value = footer
				? calcAggregation(currentData, column.name as string, column.aggregation)
				: Object(row)[column.name];
			if (column.formatter && value) return column.formatter(value);
			return value;
		}
	};
	const handleSort = (column: string, direction: 'desc' | 'asc') => {
		currentData = orderBy(data, column, direction);
		currentSort = { column, direction };
	};

	const handleSelection = (row: object) => {
		if (enableSelection && onRowClick && mode === 'Edit') return;
		const element = getObjectValues(row, dataKey ?? 'code');
		const newSelectedValues = new Set(selectedValues);

		if (newSelectedValues.has(element)) {
			newSelectedValues.delete(element);
		} else {
			newSelectedValues.add(element);
		}
		selectedValues = newSelectedValues;
		prepareSelection();
	};
	const prepareSelection = () => {
		const newRowsSelected = new Map<string, object>();
		selectedValues.forEach((value) => {
			const matchingRow = data.find((r) => getObjectValues(r, dataKey ?? 'code') === value);
			if (matchingRow) {
				newRowsSelected.set(value, matchingRow);
			}
		});
		rowsSelected = newRowsSelected;
		onSelectionChange?.(rowsSelected);
	};
	const handleRowClick = (row: object) => {
		handleSelection(row);
		if (enableSelection && onRowClick && mode !== 'Edit') return;
		onRowClick?.(row);
	};

	onMount(() => {
		if (type !== 'dropdown') {
			const gridMain = document.getElementById('grid-main');
			if (gridMain) {
				let topOffset = gridMain.getBoundingClientRect().top;
				gridMainHeight = `max-height: calc(100dvh - ${topOffset + 2}px); `;
			}
		} else {
			gridMainHeight = 'max-height: 14rem;';
		}
	});

	const copyToClipboard = () => {
		if (data.length > 0) {
			const headers = Array.from(visibleColumns).map((column) => column.label);
			const rows = data.map((row) =>
				Array.from(visibleColumns)
					.map((column) => getValue(row, column))
					.join('\t')
			);
			const clipboardData = [headers.join('\t'), ...rows].join('\n');
			navigator.clipboard.writeText(clipboardData);
			toast.success('Copied to clipboard');
		} else {
			toast.error('No data to copy');
		}
	};
</script>

{#if loading}
	<Progressbar />
{/if}
<div
	id="grid-main"
	class={cn('flex flex-1 flex-col gap-1 rounded-sm ', type !== 'dropdown' && `p-1`)}
	style="{gridMainHeight};"
>
	{#if type !== 'dropdown'}
		<div class="md:flex-rows flex flex-col gap-1 sm:flex-row">
			{#if actions}
				<div class="flex w-full gap-1 overflow-x-auto">
					{#each actions as action}
						<Button {...action} disabled={loading} />
					{/each}
				</div>
			{/if}
			<div class="flex w-full flex-row flex-wrap items-end justify-end gap-1 pr-3">
				{#if enableSelection && onRowClick}
					<Button
						variant="outline"
						size="icon"
						disabled={loading}
						onclick={() => {
							mode = mode === 'Edit' ? 'Select' : 'Edit';
						}}
					>
						<Icon name={mode === 'Edit' ? 'PencilLine' : 'SquareCheckBig'} />
					</Button>
				{/if}
				{#if data.length > 0}
					<Button
						variant="outline"
						size="icon"
						disabled={loading}
						onclick={() => copyToClipboard()}
					>
						<Icon name="Clipboard" />
					</Button>
				{/if}
				<div class="flex h-10 items-center justify-center gap-1 rounded-md border-2 px-2">
					{#if selectedValues.size > 0 && enableSelection}
						<span class="pr-1">{selectedValues.size}</span>
						<Separator orientation="vertical" class="bg-slate-400" />
					{/if}
					<span>{currentData.length}</span>
				</div>
				{#if enableFilter}
					<Filter bind:data={filterData} fields={filterFields} />
				{/if}
				{#if filters.length > 0}
					<Button variant="outline" size="icon" disabled={loading} onclick={() => (filters = [])}>
						<Icon name="FilterX" />
					</Button>
				{/if}
				<DropdownMenu menu={columnsMenu} disabled={loading}>
					<Icon name="GripVertical" class="-mx-1" />
				</DropdownMenu>
				<Input
					icon="Search"
					placeholder="Search"
					bind:value={searchTerm}
					class="border-2"
					disabled={loading}
					autocomplete="off"
					autocorrect="off"
					spellcheck="false"
					autocapitalize="off"
					indirect
					onkeydown={(e) => {
						if (e.key === 'ArrowDown' && currentData.length > 0) {
							e.preventDefault();
							focusedRowIndex = 0;
							rows[0]?.focus();
						}
					}}
				/>
			</div>
		</div>
	{:else}
		<Input
			icon="Search"
			placeholder="Search"
			bind:value={searchTerm}
			disabled={loading}
			indirect
			autocomplete="new-password"
			autocorrect="off"
			spellcheck="false"
			autocapitalize="off"
			onkeydown={(e) => {
				if (e.key === 'ArrowDown' && currentData.length > 0) {
					e.preventDefault();
					focusedRowIndex = 0;
					rows[0]?.focus();
				}
			}}
		/>
	{/if}
	<div class={cn('relative overflow-x-auto shadow-md sm:rounded-lg')}>
		<table class="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
			{#if !hideHeader}
				<thead
					class="sticky top-0 bg-gray-200 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400"
				>
					<tr>
						{#if isSelectable}
							<th class={cn('p-2 text-center align-middle [&:has([role=checkbox])]:pr-0')}>
								<Checkbox bind:checked={isAllSelected} onCheckedChange={toggleSelectAll} />
							</th>
						{/if}

						{#each visibleColumns as column}
							<th scope="col">
								<Header
									bind:filters
									{column}
									{handleSort}
									data={pluckUnique(data, column?.name)}
									sortOrder={currentSort
										? currentSort.column === column.name
											? currentSort.direction
											: undefined
										: undefined}
								/>
							</th>
						{/each}
					</tr>
				</thead>
			{/if}
			<tbody bind:this={tableBody}>
				{#each currentData as row, index}
					<tr
						bind:this={rows[index]}
						class={cn(
							'border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600',
							focusedRowIndex === index && 'bg-gray-100 dark:bg-gray-700',
							(enableSelection || onRowClick) && 'cursor-pointer'
						)}
						onclick={() => handleRowClick(row)}
						onkeydown={handleKeyDown}
						tabindex="0"
						role="row"
					>
						{#if isSelectable}
							<td
								class={cn(
									'flex-shrink-0 whitespace-nowrap p-2 text-center align-middle [&:has([role=checkbox])]:pr-0'
								)}
							>
								<Checkbox
									tabindex={-1}
									checked={selectedValues.has(getObjectValues(row, dataKey ?? 'code'))}
								/>
							</td>
						{/if}
						{#each visibleColumns as column}
							<td
								class={cn(
									'whitespace-nowrap border-x px-2 py-2',
									`${column.textAlign ? 'text-' + column.textAlign : 'text-center'}`
								)}>{getValue(row, column)}</td
							>
						{/each}
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr
					class="sticky bottom-0 mb-2 bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400"
				>
					{#if isSelectable}
						<td
							class={cn('flex-shrink-0 p-2 text-center align-middle [&:has([role=checkbox])]:pr-0')}
						>
						</td>
					{/if}
					{#each visibleColumns as column}
						<td
							class={cn(
								'whitespace-nowrap px-2 py-1 text-center text-base font-bold',
								`${column.textAlign ? 'text-' + column.textAlign : 'text-center'}`
							)}
						>
							{getValue({}, column, true)}
						</td>
					{/each}
				</tr>
			</tfoot>
		</table>
	</div>
</div>
