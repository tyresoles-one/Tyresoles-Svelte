<script lang="ts">
	import { Button } from '$lib/components/custom/button';
	import DialogPage from '../dialog-page/dialog-page.svelte';
	import { Form } from '../form';
	import { buildSchema, prepareValidationResult, validate, type ValidationResult } from '$lib/managers/services/validation';
	import type { InputProps } from '../types';
	import { toast } from 'svelte-sonner';
	import { forEach, isArray, values } from 'lodash-es';
	import { error } from '@sveltejs/kit';

	let {
		icon = 'Filter',
		label,
		disabled = false,
		fields = $bindable([]),
		data = $bindable(),
		onSubmit,
		onOpenChange,
	} = $props<{
		icon?: string;
		label?: string;
		fields?: InputProps[];
		data?: object;
		disabled?: boolean;
		onSubmit?: () => void;
		onOpenChange?: (open: boolean) => void;
	}>();

	let open = $state(false);
	let schema = $derived.by(() => buildSchema(fields));
	let errors = $state<ValidationResult>(prepareValidationResult(data));
	$effect(()=>{
		onOpenChange?.(open);
	})
	$inspect(errors, 'errors');
</script>

<Button {icon} {disabled} variant="ghost" size="icon" onclick={() => (open = !open)}>{label}</Button>
{#if fields && fields.length > 0}
	<DialogPage
		icon="Filter"
		title="Filter"
		actionLabel="Apply Filter"
		interactOutsideBehavior='ignore'
		escapeKeydownBehavior='ignore'
		onAction={() => {
			errors = validate(data, schema);
			if (Object.values(errors).some(arrError => arrError.length > 0)) {
				Object.values(errors).forEach((e) => {
					if(isArray(e) && e.length > 0) {
						e.forEach((err) => {
							toast.error(err);
						});
					}
				});
				return;
			}
			onSubmit?.();
			open = false;
		}}
		{open}
		onOpenChange={(o) => {
			open = o;
		}}
	>
		<Form
			{fields}
			bind:data
			layoutClass="grid gap-2 md:grid-cols-3 sm:grid-cols-1 sm:overflow-y-auto sm:flex-1"
		/>
	</DialogPage>
{/if}
