<!-- @component
Render a page from a PDF document. Must be a child of a `Document` component.
-->
<!-- <svelte:options immutable /> -->

<script module lang="ts">
	// Import no longer needed; using CDN-loaded pdfjsLib from window
	import type { CalcViewport, MultipleOf90 } from './utils/target_dimension';
	import { getContext, onDestroy } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { BROWSER } from 'esm-env';
</script>

<script lang="ts">
	import PageCanvas from './PageInternals/pageCanvas.svelte';

	let {
		renderer = 'canvas',
		num,
		scale = 1.5,
		rotation = 0,
		renderTextLayer = false,
		getViewport = undefined,
		pagerendersuccess,
		pagerendererror
	} = $props<{
		renderer?: 'canvas' | 'svg';
		num?: number;
		scale?: number;
		rotation?: MultipleOf90;
		renderTextLayer?: boolean;
		getViewport?: CalcViewport | undefined;
		pagerendersuccess?: (value: any) => void;
		pagerendererror?: (value: unknown) => void;
	}>();

	onDestroy(() => {
		if (page) {
			page.cleanup();
		}
	});

	// Get the current PDF document from the context
	const current_doc: Writable<any | null> = getContext('svelte_pdfjs_doc');

	// Store the page and viewport information
	let page = $state<any | null>(null);
	let viewport = $state<any | null>(null);

	// Helper function to get the correct viewport (scale + rotation)
	let _get_viewport = $derived.by<CalcViewport>(() => {
		return getViewport ?? ((p: any, r: any) => p.getViewport({ scale, rotation: r }));
	});
	//$: _get_viewport = getViewport ?? ((p, r) => p.getViewport({ scale, rotation: r }));

	// Load the page when the page number or document changes
	$effect(() => {
		if (Boolean(BROWSER && $current_doc)) {
			$current_doc?.getPage(num).then((p) => {
				page = p;
			});
		}
	});

	$effect(() => {
		if (BROWSER && page) {
			viewport = _get_viewport(page, rotation);
		}
	});
</script>

<!-- Conditionally render the page using canvas or svg (currently only canvas supported) -->
{#if BROWSER && renderer === 'canvas'}
	<PageCanvas
		{page}
		{viewport}
		render_text_layer={renderTextLayer}
		{pagerendersuccess}
		{pagerendererror}
	/>
{:else if renderer === 'svg'}
	<p>SVG rendering not implemented yet.</p>
{/if}
