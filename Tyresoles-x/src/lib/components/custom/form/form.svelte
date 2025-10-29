<script lang="ts">
	import { onMount } from 'svelte';
	import type { FormProps } from '$lib/components/custom/types';
	import { Input } from '$lib/components/custom/input';
	import { Icon } from '$lib/components/custom/icon';
	import { Button } from '$lib/components/custom/button';
	import { Alert } from '$lib/components/custom/alert';
	import { ProgressBar } from '$lib/components/custom/progress-bar';
	import { cn } from '$lib/utils';
	import { getDeviceType } from '$lib/managers/services/device';
	import {
		validate,
		type ValidationResult,
		buildSchema,
		prepareValidationResult
	} from '$lib/managers/services/validation';
	import { getSafeBottomPadding } from '$lib/managers/services/util';
	let { data = $bindable<Record<string, any>>(), ...props }: FormProps = $props();
	let visibleFields = $derived(
		props.fields
			.filter((field) => field.name && !field.hidden)
			.filter((field) => field !== undefined)
	);
	let hiddenFields = $derived(
		props.fields
			.filter((field) => field.name && field.hidden)
			.filter((field) => field !== undefined)
	);
	let schema = $derived.by(() => buildSchema(props.fields));
	let errors = $state<ValidationResult>(prepareValidationResult(data));
	let gridMainHeight = $state<string>('auto');
	let errorsHidden = $derived.by(() => {
		if (hiddenFields.length === 0) return {};
		let obj = {};
		Object.keys(errors)
			.filter((k) => hiddenFields.map((field) => field.name).includes(k))
			.forEach((k) => {
				obj[k] = errors[k];
			});
		return obj;
	});

	// Add form reference

	const rootId = crypto.randomUUID();
	const formId = crypto.randomUUID();

	const getFocusableElements = () => {
		const rootElement = document.getElementById(rootId);
		if (!rootElement) return [];
		const inputs = Array.from(
			rootElement.querySelectorAll('input:not([disabled]):not([readonly])')
		);
		const submitButton = rootElement.querySelector('button[type="submit"]');
		const otherButtons = Array.from(
			rootElement.querySelectorAll(
				'button:not([type="submit"]):not([disabled]):not([tabindex="-1"])'
			)
		);
		return [...inputs, submitButton].filter(Boolean);
	};

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab' && event.key !== 'Enter') return;
		const focusableElements = getFocusableElements();
		const focusedElement = document.activeElement;
		if (focusedElement === null) return;

		let currentIndex = focusableElements.indexOf(focusedElement);

		if (focusedElement.tagName === 'BUTTON') {
			if (focusedElement?.name) {
				const inputElement = focusableElements.find(
					(element) => element?.name === focusedElement?.name
				);
				if (inputElement) {
					currentIndex = focusableElements.indexOf(inputElement);
				}
			} else if (focusedElement?.type === 'submit') {
				handleSubmit(event);
				return;
			}
		}
		if (event.shiftKey) {
			event.preventDefault();
			const nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
			focusableElements[nextIndex]?.focus();
		} else {
			event.preventDefault();
			const focusableElements = getFocusableElements();
			const nextIndex = (currentIndex + 1) % focusableElements.length;
			focusableElements[nextIndex]?.focus();
		}
	}

	onMount(() => {
		const gridMain = document.getElementById(rootId);
		if (gridMain) {
			let topOffset = gridMain.getBoundingClientRect().top;
			gridMainHeight = `max-height: calc(100dvh - ${topOffset + 2}px); `;
		}

		const focusableElements = getFocusableElements();
		if (focusableElements.length > 0) {
			setTimeout(() => {
				focusableElements[0]?.focus();
			}, 1000);
		}
	});
	function handleSubmit(event: Event) {
		event.preventDefault();
		errors = validate(data, schema);
		if (Object.values(errors).every((v) => Array.isArray(v) && v.length === 0)) {
			const numberFields = props.fields.filter((field) => field.type === 'number');
			numberFields.forEach((field) => {
				data[field.name] = parseFloat(data[field.name]);
			});
			props.onSubmit?.(data);
		}
	}

	//$inspect(props.fields, 'from form-new');
	//$inspect(visibleFields, 'from form-new visibleFields');
</script>

<div
	id={rootId}
	onkeydown={handleKeydown}
	class={cn(
		'bg-muted/50 dark:bg-muted/50 flex w-full flex-col border-slate-200 shadow-sm',
		props.class
	)}
	style="{gridMainHeight};"
>
	{#if props.image}
		<img
			src={props.image}
			alt={props.title}
			class={'h-40 w-full rounded-md rounded-b-none object-cover sm:h-28 md:h-36 lg:h-40'}
		/>
	{/if}
	{#if props.title || props.description || props.icon}
		<div class="border-b border-slate-200 p-4 pb-3 pt-2 shadow-sm">
			{#if props.title}
				<div class="flex flex-row items-center gap-1">
					{#if props.icon}
						<Icon name={props.icon} class="text-muted-foreground mr-1 h-5 w-5" />
					{/if}
					<div class="text-lg font-semibold">{props.title}</div>
				</div>
			{/if}
			{#if props.description}
				<div class="text-sm text-slate-400">{props.description}</div>
			{/if}
		</div>
	{/if}
	{#if props.loading}
		<ProgressBar />
	{/if}
	<form id={formId} onsubmit={handleSubmit} class={cn('flex flex-col', props.class)}>
		<div class={cn('overflow-y-auto py-2')}>
			<div class={cn(props.layoutClass)}>
				{#each visibleFields as field, index}
					{#if field.name && field.name in data}
						<Input
							{...field}
							tabindex={index}
							bind:value={data[field.name]}
							errors={errors[field.name]}
							disabled={field.disabled || props.loading}
						/>
					{/if}
				{/each}
			</div>
		</div>
		<div class="flex w-full flex-grow justify-between gap-2 overflow-x-auto px-4 pb-4">
			{#if props.actions}
				{#each props.actions as action}
					<Button
						{...action}
						{...action.type === 'submit'
							? { type: 'submit', form: formId, onclick: handleSubmit }
							: {}}
						disabled={action.disabled || props.loading}
					/>
				{/each}
			{/if}
		</div>
	</form>
</div>
