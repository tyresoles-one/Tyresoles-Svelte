<!-- @component
Renderless component responsible for just loading the document and providing it to
children Page components through the context API.
-->
<script lang="ts" module>
	import { BROWSER } from 'esm-env';
	import { getContext, onDestroy, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	// Define PDF.js types manually if necessary (optional)
	type PDFDocumentLoadingTask = any; // Replace with actual types if available
	type PDFDocumentProxy = any; // Replace with actual types if available
	type PDFWorker = any; // Replace with actual types if available

	interface DocumentInitParameters {
		url?: string;
		data?: Uint8Array;
	}
	interface OnProgressParameters {
		loaded: number;
		total: number;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { loadsuccess, loaderror, file, data, loadOptions, onProgress, children } = $props<{
		loadsuccess?: (document: any) => void;
		loaderror?: (error: any) => void;
		file?: string | URL | undefined;
		data?: string | undefined;
		loadOptions?: DocumentInitParameters | undefined;
		onProgress?: undefined | ((params: OnProgressParameters) => void);
		children: Snippet;
	}>();

	const worker = getContext<PDFWorker | undefined>('svelte_pdfjs_worker');

	let current_doc = writable<PDFDocumentProxy | null>();
	let loading_task: PDFDocumentLoadingTask;

	let isLoading: boolean = false;

	setContext('svelte_pdfjs_doc', current_doc);

	onDestroy(() => {
		$current_doc?.destroy();
		$current_doc?.cleanup(false);
	});

	async function load_document() {
		const prev_doc = $current_doc;

		// Clear current document state
		current_doc.set(null);

		try {
			// Ensure `pdfjsLib` is available in the window (loaded from CDN)
			if (!window.pdfjsLib || !window.pdfjsLib.getDocument) {
				throw new Error('PDF.js library not loaded from CDN');
			}

			// Destructure `getDocument` from `pdfjsLib`
			const { getDocument } = window.pdfjsLib;

			// Load the PDF document using the provided file and options
			loading_task = getDocument({ url: file, data, worker, ...loadOptions });
			loading_task.onProgress = onProgress!;

			console.log(loading_task, 'loading_task');

			loading_task.promise
				.then(
					(doc: PDFDocumentProxy) => {
						prev_doc?.destroy();
						prev_doc?.cleanup();
						loadsuccess?.(doc);
						return doc;
					},
					(err: any) => {
						loaderror?.(err);
						return prev_doc;
					}
				)
				.then(current_doc.set);
		} catch (err) {
			// Handle error case, including if `pdfjsLib` is unavailable
			console.error('Error loading document:', err);

			// Restore the previous document if available
			if (prev_doc) {
				current_doc.set(prev_doc);
			}

			// Dispatch the loaderror event with the error information
			loaderror?.(err);
		}
	}

	$effect(() => {
		const test = `from Document effect 2 :  ${data.length}, ${isLoading}, ${file}, ${loadOptions}, ${BROWSER}`;
		if (BROWSER && !isLoading && (data || file || loadOptions)) {
			console.log('from effect 2');
			isLoading = true;
			load_document().finally(() => {
				isLoading = false;
			});
		}
	});
</script>

<div>
	{@render children?.()}
</div>
