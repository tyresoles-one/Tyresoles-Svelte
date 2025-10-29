<script lang="ts" module>
	// Use global RenderingCancelledException from the CDN instead of importing it
	const { RenderingCancelledException } = window?.pdfjsLib;

	// Event dispatcher for render success and error events
	import { createEventDispatcher, tick } from 'svelte';
	import TextLayer from './TextLayer.svelte';

	// Types for the page and viewport for TypeScript (using `any` since we are using the CDN)
	type PDFPageProxy = any;
	type RenderTask = any;
	type PageViewport = any;
</script>

<script lang="ts">
	let {
		page,
		viewport,
		render_text_layer,
		canvasStyles = '',
		pagerendersuccess,
		pagerendererror
	} = $props<{
		page?: PDFPageProxy;
		viewport?: PageViewport;
		render_text_layer?: boolean;
		canvasStyles?: string;
		pagerendersuccess?: (value: any) => void;
		pagerendererror?: (value: unknown) => void;
	}>();

	let canvas: HTMLCanvasElement; // Reference to the canvas element
	let render_task: RenderTask; // The rendering task (to handle canceling previous tasks)

	// Function to render the page into the canvas
	async function render_page() {
		// Cancel any ongoing rendering task
		render_task?.cancel();

		// Wait for the DOM update
		await tick();

		// Start rendering the page into the canvas context
		render_task = page.render({
			canvasContext: canvas.getContext('2d')!, // Ensure canvas context is available
			viewport
		});

		try {
			// Await the rendering to finish
			await render_task.promise;
			// Dispatch the render success event with the page object
			//dispatch('pagerendersuccess', page);
			pagerendersuccess?.(page);
		} catch (err) {
			// Handle errors that are not related to rendering cancellation
			if (!(err instanceof RenderingCancelledException)) {
				pagerendererror?.(err);
				throw err;
			}
		}
	}

	// Reactive block: re-render the page whenever the viewport or canvas changes
	// $: if (viewport && canvas) render_page();
	$effect(() => {
		if (viewport && canvas) {
			render_page();
		}
	});
</script>

<!-- Page rendering with optional text layer -->
<div style:--scale-factor={viewport?.scale ?? null}>
	<canvas bind:this={canvas} width={viewport?.width} height={viewport?.height} style={canvasStyles}>
		{#if render_text_layer}
			<!-- Render the optional text layer if requested -->
			<TextLayer {page} {viewport} />
		{/if}
	</canvas>
</div>

<!-- Styles for the canvas and container div -->
<style>
	div {
		position: relative;
		padding: 0;
	}

	canvas {
		display: block;
		margin: 0;
	}
</style>
