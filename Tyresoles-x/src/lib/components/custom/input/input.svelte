<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Popover from '$lib/components/ui/popover';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';
	import { Icon } from '$lib/components/custom/icon';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { parseDate, type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { Root as DropdownTable } from '$lib/components/custom/table';
	import Grid from '../grid/grid.svelte';
	import { Calendar } from '$lib/components/custom/calendar';
	import type { InputProps, TableColumn } from '../types';
	import { generateRandomID } from '$lib/managers/services/text';
	import {
		parseStringToDateValue,
		parseDateToDateValue,
		formatDate,
		presets
	} from '$lib/managers/services/date';

	let {
		type,
		icon,
		class: inputClass,
		value = $bindable(),
		id,
		data,
		dataKey,
		valueKey,
		labelKey,
		columns,
		readonly,
		disabled,
		selectionType = 'single',
		enableSelection,
		output = 'string',
		onInput,
		format,
		yearsOnCalendar,
		yearsOnCalendarFuture,
		preset,
		enableSearch,
		hideHeader,
		fromDate = $bindable(undefined),
		toDate = $bindable(undefined),
		label,
		description,
		errors,
		rules,
		popoverAnchorClass,
		...restProps
	}: InputProps = $props();
	id = id ?? generateRandomID();

	let customAnchor = $state<HTMLElement>(null!);
	let open = $state(false);
	let showPassword = $state(false);
	let displayValues = $state<Array<string>>([]);
	let dateBind = $state<DateValue | DateValue[] | undefined>(undefined);
	let selections = $state<Array<{ key: String; data: object }>>([]);
	let showClear: boolean = $derived(value && value.length > 0 && !readonly);
	let presetOptions: Array<{ name: string; label: string; from: Date; to: Date }> = $derived.by(
		() => {
			if (preset && preset.length > 0) {
				return preset.split(',').map((p) => {
					const option = presets.find((v) => v.key === p);
					if (option) {
						return { name: option.name, label: option.label, from: option.from, to: option.to };
					}
				});
			}
			return [];
		}
	);

	let passwordIcon = $derived(showPassword ? 'EyeOffIcon' : 'EyeIcon');
	let badgeCount: number = $derived(
		selectionType === 'multiple' ? selections.length || displayValues.length : 0
	);
	let classClear: string = $derived.by(() => {
		let cls = '';
		cls += type === 'password' ? 'mx-8 ' : 'px-3 ';
		cls += badgeCount > 0 ? 'right-8 ' : 'right-0 ';
		return cls;
	});

	let inputType = $derived(() => {
		switch (type) {
			case 'password':
				return showPassword ? 'text' : 'password';
			default:
				return 'text';
		}
	});

	const onfocus = () => {
		if (type === 'list' || type === 'date') open = true;
	};
	const onblur = () => {
		if (type === 'number' && value && typeof value === 'string') {
			value = parseFloat(value).toFixed(2);
		}
	};
	const onRowClick = (row: object) => {
		//console.log(row, 'row');
	};

	const onClear = () => {
		value = undefined;
		onInput?.(undefined);
	};

	//Date: Controller
	$effect(() => {
		if (type === 'date') {
			//console.log(value, 'value in date effect');
			if (value) {
				let newDisplayValues: Array<string> = [];
				if (selectionType === 'multiple') {
					if (typeof value === 'string') {
						dateBind = value.split(',').map((v) => parseStringToDateValue(v));
						newDisplayValues = value
							.split(',')
							.map((v) => formatDate(v))
							.filter((v) => v !== undefined) as Array<string>;
					} else if (Array.isArray(value)) {
						let newDateBind: DateValue[] = [];
						value.forEach((v) => {
							if (typeof v === 'string') {
								newDateBind.push(parseStringToDateValue(v));
								if (formatDate(v) !== undefined) newDisplayValues.push(formatDate(v) as string);
							} else if (v instanceof Date) {
								newDateBind.push(parseDateToDateValue(v));
								if (formatDate(v) !== undefined) newDisplayValues.push(formatDate(v) as string);
							}
						});
						dateBind = newDateBind;
					}
				} else {
					//console.log(value instanceof Date, 'value is Date');
					if (typeof value === 'string') {
						dateBind = parseStringToDateValue(value);
						if (formatDate(value) !== undefined) newDisplayValues.push(formatDate(value) as string);
					} else if (value instanceof Date) {
						dateBind = parseDateToDateValue(value);
						if (formatDate(value) !== undefined) newDisplayValues.push(formatDate(value) as string);
					}
				}
				displayValues = newDisplayValues;
			} else {
				displayValues = [];
				dateBind = undefined;
			}
		}
	});
	const onDateChange = (dateValue: DateValue | DateValue[] | undefined) => {
		if (dateValue === undefined) {
			value = undefined;
			//console.log('onDateChange undefined');
			onInput?.(undefined);
			return;
		}
		if (Array.isArray(dateValue)) {
			if (output === 'string') {
				value = dateValue.map((v) => formatDate(v.toDate(getLocalTimeZone()), format)).join(',');
			} else if (output === 'date') {
				value = dateValue.map((v) => v.toDate(getLocalTimeZone()));
			}
		} else {
			if (output === 'string') {
				value = formatDate(dateValue.toDate(getLocalTimeZone()), format);
			} else {
				value = dateValue.toString(); //dateValue.toDate(getLocalTimeZone());
			}
		}
		onInput?.(value);
		if (selectionType === 'single') open = false;
	};
	const onPresetChange = (preset: { name: string; label: string; from: Date; to: Date }) => {
		//console.log(preset, 'onPresetChange');
		open = false;
		if (preset.name !== 'Let me choose') {
			fromDate = output === 'date' ? preset.from : formatDate(preset.from);
			toDate = output === 'date' ? preset.to : formatDate(preset.to);
			onInput?.(fromDate, toDate);
		}
		displayValues = [preset.label];
	};
	//List: Controller
	$effect(() => {
		if (type === 'list') {
			let newDisplayValues: string[] = [];
			if (value !== '' && value !== 'undefined' && value !== null) {
				if (selectionType === 'multiple') {
					if (typeof value === 'string') {
						const values = value.split(',');
						newDisplayValues = values
							.map((v) => data?.find((d) => d[valueKey ?? 'code'] === v)?.[labelKey ?? 'value'])
							.filter(Boolean);
					} else if (Array.isArray(value)) {
						newDisplayValues = value
							.map((v) => data?.find((d) => d[valueKey ?? 'code'] === v)?.[labelKey ?? 'value'])
							.filter(Boolean);
					}
				} else {
					const key: string = (valueKey ? valueKey : labelKey) ?? 'code';
					const record = data?.find((d) => {
						return d[key] === value;
					});

					if (record) {
						newDisplayValues = [record[labelKey ?? 'value']];
					}
				}
			}

			displayValues = newDisplayValues;
		} else if (type === 'number') {
			if (value === undefined) return;
			if (typeof value !== 'string') return;
			const sanitizedValue = value.replace(/[^0-9.]/g, '');
			const parts = sanitizedValue.split('.');
			if (parts.length > 2) {
				parts.length = 2; // Keep only two parts
			}
			const finalValue = parts.join('.');
			value = finalValue;
		}
	});
	const onSelectionChange = (selection: Map<string, object>) => {
		if (selection && selection.size > 0) {
			if (output === 'string') {
				value = Array.from(selection.keys()).join(',');
			} else if (output === 'array') {
				value = Array.from(selection.keys());
			} else if (output === 'number') {
				value = Number.parseInt(Array.from(selection.keys()).join());
			}
		} else {
			value = undefined;
		}
		if (selectionType === 'single' && selection.size === 1) open = false;
		onInput?.(value, selection);
	};

	const removeDisplayValue = (val: string) => {
		displayValues = displayValues.filter((v) => v !== val);
		if (selectionType === 'multiple') {
			if (output === 'string') {
				value = value
					.split(',')
					.filter((v: string) => v !== val)
					.join(',');
			} else if (output === 'array') {
				const key: string = (valueKey === labelKey ? valueKey : labelKey) ?? 'code';
				const record = data?.find((d) => d[key] === val);
				const valueToRemove = record ? record[valueKey ?? 'code'] : val;
				value = value?.filter((v: string) => v !== valueToRemove);
			}
		} else {
			value = undefined;
		}
	};
	// if (type === 'list') {
	// 	$inspect(data, 'from input');
	//  $inspect(open, 'open');
	// }
</script>

{#if type === 'boolean'}
	<div class="flex items-center gap-3">
		<Checkbox {id} {value} />
		<!-- Label -->
		{#if label}
			<Label
				class={cn(
					'group-focus-within:text-primary flex-1 text-slate-400',
					errors && errors.length > 0 && 'text-red-500'
				)}
				for={id}>{label}</Label
			>
		{/if}
	</div>
{:else}
	<div class={cn('group')}>
		{#if label || description}
			<div
				class={cn(
					'mb-2 flex flex-row justify-between px-1',
					errors && errors.length > 0 && 'text-red-500'
				)}
			>
				<!-- Label -->
				{#if label}
					<Label
						class={cn(
							'group-focus-within:text-primary flex-1 text-slate-400',
							errors && errors.length > 0 && 'text-red-500'
						)}
						for={id}>{label}</Label
					>
				{/if}
				<!-- Description -->
				{#if description}
					<p
						class={cn(
							'text-right text-xs text-slate-400 group-focus-within:text-slate-500',
							errors && errors.length > 0 && 'text-red-500'
						)}
					>
						{description}
					</p>
				{/if}
			</div>
		{/if}
		<div class="relative">
			<!-- Input -->
			<Input
				{id}
				bind:value
				{...restProps}
				{onfocus}
				{onblur}
				{readonly}
				class={cn(
					icon && 'pl-8',
					errors && errors.length > 0 && 'border-red-500',
					(type === 'date' || type === 'list') && 'text-background',
					type === 'password' && '[&::-ms-clear]:hidden [&::-ms-reveal]:hidden',
					'focus-within:text-primary text-slate-400',
					inputClass
				)}
				type={inputType()}
			/>
			<!-- Display Values -->
			{#if (type === 'date' || type === 'list') && displayValues.length > 0}
				<div
					tabindex="-1"
					class={cn(
						'bg-background absolute top-0 flex h-full w-[calc(100%)] flex-row gap-1 overflow-y-auto rounded-md border',
						icon ? 'left-8' : 'left-0 pr-3'
					)}
				>
					{#each displayValues as value}
						{@render chip(value, () => removeDisplayValue(value), readonly)}
					{/each}
				</div>
			{/if}
			<!-- Icon -->
			{#if icon}
				<div class="absolute left-0 top-0 flex h-full items-center justify-center">
					<Icon name={icon} class="group-focus-within:text-primary ml-2 h-4 w-4 text-slate-400" />
				</div>
			{/if}
			<!-- Clear -->
			{@render button('X', onClear, showClear)}
			<!-- Password -->
			{@render button(
				passwordIcon,
				() => (showPassword = !showPassword),
				type === 'password',
				showClear ? 'mr-7' : ''
			)}
			<!-- Badge -->
			{#if badgeCount > 0}
				<Button
					tabindex={-1}
					variant="ghost"
					size="sm"
					class="absolute right-0 top-0 h-full py-2 hover:bg-transparent"
					onclick={() => {
						//console.log('clicked');
					}}
				>
					<Badge>{badgeCount}</Badge>
				</Button>
			{/if}
		</div>

		<!-- Errors -->
		{#if errors && errors.length > 0}
			<div class="flex flex-row gap-1 px-1">
				<span class="text-xs text-red-500">{errors[0]}</span>
				{#if errors.length > 1}
					<span class="ml-1 text-xs text-red-500"
						>{`+${errors.length - 1} more error${errors.length > 2 ? 's' : ''}`}</span
					>
				{/if}
			</div>
		{/if}

		{#if type === 'list' || type === 'date'}
			<div class={cn('-mt-0 h-0  bg-slate-500', popoverAnchorClass)} bind:this={customAnchor}></div>
			<Popover.Root open={disabled ? false : open} onOpenChange={(o) => (open = o)}>
				<Popover.Trigger name={restProps.name} onblur={() => (open = false)} />

				<Popover.Content
					{customAnchor}
					onCloseAutoFocus={(e) => {
						e.preventDefault();
					}}
					class="max-w-96 p-0"
				>
					{#if type === 'list'}
						<Grid
							type="dropdown"
							data={data ?? []}
							{dataKey}
							{valueKey}
							{labelKey}
							{columns}
							value={value as string}
							{enableSelection}
							{selectionType}
							{onRowClick}
							{onSelectionChange}
							{enableSearch}
							{hideHeader}
						/>
					{:else if type === 'date'}
						<Calendar
							type={selectionType}
							value={dateBind}
							preset={presetOptions}
							onValueChange={onDateChange}
							{yearsOnCalendar}
							{yearsOnCalendarFuture}
							{onPresetChange}
						/>
					{/if}
				</Popover.Content>
			</Popover.Root>
		{/if}
	</div>
{/if}

{#snippet chip(label: string, onRemove: () => void, readonly?: boolean | undefined | null)}
	<div class="flex items-center justify-between gap-1 rounded-md border border-slate-300 text-xs">
		<span class="w-full whitespace-nowrap px-1">{label}</span>
		{#if !readonly}
			<button class="mr-1" onclick={onRemove} {disabled}>
				<Icon name="X" class="h-3 w-3 text-slate-400" />
			</button>
		{/if}
	</div>
{/snippet}

<!-- i want this button to be in relation to the input not the parent -->
{#snippet button(icon?: string, onClick?: () => void, show?: boolean, className?: string)}
	{#if show}
		<Button
			tabindex={-1}
			variant="ghost"
			size="sm"
			class={cn('absolute right-0 top-0 h-full py-2 hover:bg-transparent', className)}
			onclick={onClick}
			{disabled}
		>
			{#if icon}
				<Icon name={icon} class="group-focus-within:text-primary h-4 w-4 text-slate-400" />
			{/if}
		</Button>
	{/if}
{/snippet}
