<script lang="ts">
	import type { TableHeaderProps, Menu } from '../types';
	import { DropdownMenu } from '$lib/components/custom/dropdown-menu';
	import { DialogPage } from '$lib/components/custom/dialog-page';
	import { Icon } from '$lib/components/custom/icon';
	import { Input } from '$lib/components/custom/input';
	import { cn } from '../../../utils';
	let {
		type,
		column,
		filters = $bindable(),
		handleSort,
		data,
		onResize,
		width: columnWidth,
		index,
		sortOrder
	}: TableHeaderProps = $props();
	let show: boolean = $state(false);
	let value = $state('');
	let menu: Menu = $state({
		label: column?.label,
		items: [
			{
				label: 'Sort',
				icon: 'ArrowDownUp',
				items: [
					{
						label: 'Asc',
						icon: 'ArrowUpWideNarrow',
						onClick: () => {
							if (handleSort && column) handleSort(column?.name ?? '', 'asc');
						}
					},
					{
						label: 'Desc',
						icon: 'ArrowDownWideNarrow',
						onClick: () => {
							if (handleSort && column) handleSort(column?.name ?? '', 'desc');
						}
					}
				]
			},
			{
				label: 'Filter',
				icon: 'Filter',
				onClick: () => {
					show = true;
				}
			}
		]
	});
	$effect(() => {
		if (type === 'table') {
			const idx = filters?.findIndex((f) => f.column === column?.name) ?? -1;
			if (idx > -1) {
				const mIdx = menu?.items?.findIndex((i) => i.label === 'Remove Filter') ?? -1;
				if (mIdx === -1) {
					menu?.items?.push({
						label: 'Remove Filter',
						onClick: () => {
							filters?.splice(idx, 1);
							filters = filters;
						}
					});
				}
			} else {
				menu?.items?.splice(2, 1);
			}
		}
	});
	const handleOpenChange = (value: boolean) => {
		show = value;
	};
	const handleSubmit = () => {
		const idx = filters?.findIndex((c) => c.column === column?.name) ?? -1;
		if (value) {
			const obj: { column: string; value: any } = { column: column?.name ?? '', value };
			if (idx > -1) {
				filters[idx] = { ...filters[idx], ...obj };
			} else {
				filters.push(obj);
			}
		} else {
			if (idx > -1) filters.splice(idx, 1);
		}

		filters = filters;
		show = false;
	};
	$inspect(columnWidth, 'columnWidth');
</script>

<th
	class={cn(
		'h-7 w-full px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'
	)}
>
	{#if type === 'dropdown'}
		<button
			class="flex flex-row items-center px-2 py-1 font-normal"
			onclick={() => {
				if (filters?.findIndex((c) => c.column === column?.name) === -1) {
					filters?.push({ column: column?.name ?? '', value: '' });
				} else {
					filters = filters?.filter((c) => c.column !== column?.name);
				}
			}}
		>
			{#if filters && filters?.findIndex((c) => c.column === column?.name) > -1}
				<Icon name="Filter" class="mr-1 h-3 w-4" />
			{/if}
			{column?.label}
		</button>
	{:else if type === 'table'}
		<DropdownMenu {menu}>
			{#if filters.findIndex((c) => c.column === column?.name) > -1}
				<Icon name="Filter" class="mr-2 size-4" />
			{/if}
			<span class="text-clip">{column?.label}</span>
			{#if sortOrder}
				<Icon name={sortOrder === 'asc' ? 'MoveUp' : 'MoveDown'} class="size-3" />
			{/if}
		</DropdownMenu>

		<DialogPage
			title={column?.label}
			open={show}
			description={`Filter data on ${column?.label}`}
			onOpenChange={handleOpenChange}
			onAction={handleSubmit}
			actionLabel="Apply Filter"
		>
			<Input bind:value type="list" {data} hideHeader dataKey="code" labelKey="code" />
		</DialogPage>
	{/if}

	<!-- <div
		tabindex={-1}
		role="button"
		onmousedown={(event) => {
			if (onResize && index) onResize(event, index);
		}}
		ontouchstart={(event) => {
			if (onResize && index) onResize(event, index);
		}}
		aria-label="resize column"
		class="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-slate-300 hover:bg-slate-500"
	></div> -->
</th>
