<script lang="ts">
	import {
		Calendar as CalendarPrimitive,
		type CalendarRootProps,
		type WithoutChildrenOrChild
	} from 'bits-ui';
	import { DateFormatter, getLocalTimeZone, type DateValue } from '@internationalized/date';
	import * as Calendar from '$lib/components/ui/calendar/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Table from '../table/table.svelte';
	import type { TableColumn } from '../types.js';
	import { cn } from '$lib/utils.js';

	let {
		value,
		placeholder = $bindable(),
		weekdayFormat,
		class: className,
		onValueChange,
		onPresetChange,
		yearsOnCalendar = 25,
		yearsOnCalendarFuture = 0,
		preset,
		...restProps
	}: WithoutChildrenOrChild<CalendarRootProps> & {
		yearsOnCalendar?: number;
		yearsOnCalendarFuture?: number;
		preset?: Array<{ name: string; label: string; from: Date; to: Date }>;
		onPresetChange?: (preset: { name: string; label: string; from: Date; to: Date }) => void;
	} = $props();

	const monthOptions = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	].map((month, i) => ({ value: String(i + 1), label: month }));

	const monthFmt = new DateFormatter('en-US', {
		month: 'long'
	});

	let yearOptions = Array.from({ length: yearsOnCalendar }, (_, i) => ({
		label: String(new Date().getFullYear() - i),
		value: String(new Date().getFullYear() - i)
	}));

	const futureYearOptions = Array.from({ length: yearsOnCalendarFuture }, (_, i) => ({
		label: String(new Date().getFullYear() + i + 1),
		value: String(new Date().getFullYear() + i + 1)
	}));

	yearOptions = yearOptions
		.concat(futureYearOptions)
		.sort((a, b) => Number(b.value) - Number(a.value));

	let showCalendar: boolean = $state(preset && preset.length > 0 ? false : true);
	const columns: Array<TableColumn> = [
		{ name: 'name', label: 'Name' },
		{ name: 'label', label: 'Label' }
	];

	const defaultYear = $derived(
		placeholder ? { value: String(placeholder.year), label: String(placeholder.year) } : undefined
	);

	const defaultMonth = $derived(
		placeholder
			? {
					value: String(placeholder.month),
					label: monthFmt.format(placeholder.toDate(getLocalTimeZone()))
				}
			: undefined
	);

	const monthLabel = $derived(
		monthOptions.find((m) => m.value === defaultMonth?.value)?.label ?? 'Select a month'
	);
</script>

{#if preset && preset.length > 0 && !showCalendar}
	<Table
		data={preset}
		type="dropdown"
		hideHeader
		{columns}
		class="w-32"
		enableSelection={false}
		onRowClick={(row) => {
			if (row?.name === 'Let me choose') {
				showCalendar = true;
			} else {
				onPresetChange?.(row as { name: string; label: string; from: Date; to: Date });
			}
		}}
	/>
{/if}
{#if showCalendar}
	<CalendarPrimitive.Root
		{weekdayFormat}
		class={cn('rounded-md border p-3', className)}
		bind:value={value as never}
		bind:placeholder
		onValueChange={(v: DateValue | DateValue[] | undefined) => {
			onValueChange?.(v);
		}}
		{...restProps}
	>
		{#snippet children({ months, weekdays })}
			<Calendar.Header>
				<Calendar.Heading class="flex w-full items-center justify-between gap-2">
					<Select.Root
						type="single"
						value={defaultMonth?.value}
						onValueChange={(v) => {
							if (!placeholder) return;
							if (v === `${placeholder.month}`) return;
							placeholder = placeholder.set({ month: Number.parseInt(v) });
						}}
					>
						<Select.Trigger aria-label="Select month" class="w-[60%]">
							{monthLabel}
						</Select.Trigger>
						<Select.Content class="max-h-[200px] overflow-y-auto">
							{#each monthOptions as { value, label }}
								<Select.Item {value} {label} />
							{/each}
						</Select.Content>
					</Select.Root>
					<Select.Root
						type="single"
						value={defaultYear?.value}
						onValueChange={(v) => {
							if (!v || !placeholder) return;
							if (v === `${placeholder?.year}`) return;
							placeholder = placeholder.set({ year: Number.parseInt(v) });
						}}
					>
						<Select.Trigger aria-label="Select year" class="w-[40%]">
							{defaultYear?.label ?? 'Select year'}
						</Select.Trigger>
						<Select.Content class="max-h-[200px] overflow-y-auto">
							{#each yearOptions as { value, label }}
								<Select.Item {value} {label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</Calendar.Heading>
			</Calendar.Header>
			<Calendar.Months>
				{#each months as month}
					<Calendar.Grid class="w-full border-collapse select-none space-y-1">
						<Calendar.GridHead>
							<Calendar.GridRow class="mb-1 flex w-full justify-between">
								{#each weekdays as weekday}
									<Calendar.HeadCell
										class="text-muted-foreground font-normal! w-10 rounded-md text-xs"
									>
										{weekday.slice(0, 2)}
									</Calendar.HeadCell>
								{/each}
							</Calendar.GridRow>
						</Calendar.GridHead>
						<Calendar.GridBody>
							{#each month.weeks as weekDates, i (i)}
								<Calendar.GridRow class="flex w-full">
									{#each weekDates as date, i (i)}
										<Calendar.Cell
											{date}
											month={month.value}
											class="p-0! relative size-10 text-center text-sm"
										>
											<Calendar.Day
												class="rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal"
											>
												<div
													class="bg-foreground group-data-selected:bg-background group-data-today:block absolute top-[5px] hidden size-1 rounded-full"
												></div>
												{date.day}
											</Calendar.Day>
										</Calendar.Cell>
									{/each}
								</Calendar.GridRow>
							{/each}
						</Calendar.GridBody>
					</Calendar.Grid>
				{/each}
			</Calendar.Months>
		{/snippet}
	</CalendarPrimitive.Root>
{/if}
