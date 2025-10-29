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
		filters = $bindable([]),
		handleSort,
		data,
		onResize,
		width: columnWidth,
		index,
		sortOrder
	}: TableHeaderProps = $props();

	let open = $state(false);
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
					open = true;
				}
			}
		]
	});

	$effect(() => {
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
	});
	const handleOpenChange = (value: boolean) => {
		open = value;
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
		open = false;
	};

	//$inspect(data, 'column data');
</script>

<DropdownMenu {menu} triggerClass="w-full">
	{#if filters.findIndex((c) => c.column === column?.name) > -1}
		<Icon name="Filter" class="mr-2 size-3" />
	{/if}
	<span
		class={cn('text-clip', `${column?.textAlign ? 'text-' + column?.textAlign : 'text-center'}`)}
		>{column?.label}</span
	>
	{#if sortOrder}
		<Icon name={sortOrder === 'asc' ? 'MoveUp' : 'MoveDown'} class="size-3" />
	{/if}
</DropdownMenu>

<DialogPage
	title={column?.label}
	{open}
	description={`Filter data on ${column?.label}`}
	onOpenChange={handleOpenChange}
	onAction={handleSubmit}
	actionLabel="Apply Filter"
>
	<Input bind:value type="list" {data} hideHeader dataKey="code" labelKey="code" />
</DialogPage>
