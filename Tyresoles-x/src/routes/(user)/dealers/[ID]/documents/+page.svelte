<script lang="ts">
	import type { DocumentImage } from '$lib/business/models';
	import { pageStore, onMount, goto } from '$lib';
	import { Button, dialogShow, toast, dialogHide, ProgressBar } from '$lib/components';
	import { endpoints, apiFetch } from '$lib/managers/network';
	import { loadingStore } from '$lib/managers/stores';
	import { on } from 'svelte/events';
	import { image } from '@tauri-apps/api';

	let records = $state<DocumentImage[]>([]);
	const lastLineNo = $derived.by(() => {
		return records.length > 0 ? Math.max(...records.map((r) => r.lineNo)) : 0;
	});
	let index = $state<number | null>(null);

	let file: File | null = null;
	let dataUrl = $derived.by(() => {
		if (index !== null && records[index] && records[index].image) {
			return `data:image/*;base64,${records[index].image}`;
		}
		return null;
	});
	let base64Raw = $state<string | null>(null);

	onMount(() => {
		apiFetch(endpoints.sales.getDocumentImages, {
			method: 'POST',
			body: { documentNo: $pageStore.params.ID, type: 4, data: '', image: '' }
		}).then((resp) => {
			if (resp.success) {
				records = resp.data;
				index = records.length > 0 ? 0 : null;
			}
		});
	});
	const onChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			file = target.files[0];
			if (!file) {
				base64Raw = null;
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target && e.target.result) {
					let dataUrl = e.target.result as string;
					base64Raw = dataUrl.split(',')[1]; // Extract base64 part
					records.at(index ?? 0)!.image = base64Raw || '';
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const addLine = () => {		
		base64Raw = null;
		records = [
			...records,
			{
				documentNo: $pageStore.params.ID as string,
				type: 4,
				lineNo: lastLineNo + 1,
				image: base64Raw || '',
				data: ''
			}
		];
		index = records.length - 1;
	};
	const previous = () => {
		if (index !== null && index > 0) {
			index -= 1;
		}
	};
	const next = () => {
		if (index !== null && index < records.length - 1) {
			index += 1;
		}
	};
	const save = () => {
		if (records.length === 0) {
			toast.error('No records to save');
			return;
		}
		if(index === null) {
			toast.error('No record selected to save');
			return;
		}
		if(index < 0 || index >= records.length) {
			toast.error('Invalid record selected to save');
			return;
		}		
		dialogShow({
			title: 'Confirm Save',
			description: 'Are you sure you want to save these records?',
			actionLabel: 'Save',
			onAction: () => {
				dialogHide();
				apiFetch(endpoints.sales.updateDocumentImage, {
					method: 'POST',
					body: records[index ??	0]
				}).then((res) => {
					if (res.success) {
						toast.success('Records saved successfully');						
					}
				});
			}
		});
	};1
	const saveAll = () => {
		if (records.length === 0) {
			toast.error('No records to save');
			return;
		}
		let docNo: number = 0;
		dialogShow({
			title: 'Confirm Save All',
			description: 'Are you sure you want to save all these records?',
			actionLabel: 'Save',
			onAction: () => {
				dialogHide();
				apiFetch(endpoints.sales.updateDocumentImages, {
					method: 'POST',
					body: records
				}).then((res) => {
					if (res.success) {
						toast.success('Records saved successfully');
						goto(`/dealers/${$pageStore.params.ID}`);
					}
				});
			}
		});
	};
	$inspect(dataUrl, 'dataUrl');
</script>

<div class="flex flex-col gap-2">
	{#if $loadingStore}
		<ProgressBar />
	{/if}
	<div class="flex items-center gap-2">
		<Button onclick={addLine} disabled={$loadingStore}>Add New</Button>
		<Button
			onclick={previous}
			disabled={index === null || index === 0 || $loadingStore}
			icon="ChevronLeft"
		></Button>
		<Button variant="outline" disabled
			>{`${index !== null ? index + 1 : 0} of ${records.length}`}</Button
		>
		<Button
			onclick={next}
			disabled={index === null || index === records.length - 1 || $loadingStore}
			icon="ChevronRight"
		></Button>
		<Button onclick={save} disabled={index === null || $loadingStore}>Save</Button>
		<Button onclick={saveAll} disabled={index === null || $loadingStore}>Save All</Button>
	</div>
	{#if dataUrl}
		<img src={dataUrl} alt="Uploaded Image" />
	{/if}
	{#if index !== null}				
	<label class="block m-2 p-4 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
      <span class="block mb-2 text-sm font-medium  text-gray-900 dark:text-white">Choose document photo</span>
      <input type="file" class="block w-full text-sm text-gray-500
        file:me-4 file:py-2 file:px-4
        file:rounded-lg file:border-0
        file:text-sm file:font-semibold
        file:bg-gray-900 file:text-white
        hover:file:bg-gray-700
        file:disabled:opacity-50 file:disabled:pointer-events-none
        dark:text-neutral-500
        dark:file:bg-gray-500
        dark:hover:file:bg-gray-400
      " accept="image/*" onchange={onChange} disabled={$loadingStore} />
    </label>
	{/if}
</div>
