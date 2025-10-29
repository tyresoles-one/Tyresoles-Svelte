<script lang="ts">
	import { BROWSER } from 'esm-env';

	// Define types for PDF.js objects (using `any` since they are from the CDN)
	type PageViewport = any;
	type PDFPageProxy = any;
	type TextLayerRenderTask = any;

	export let page: PDFPageProxy;
	export let viewport: PageViewport;

	let render_task: TextLayerRenderTask | null = null; // Initialize render task
	let container: HTMLDivElement; // Bind to the container div

	// Function to render the text layer
	async function render_text_layer() {
		// Clear any existing content in the container
		container.textContent = '';

		// Access renderTextLayer function from the globally available pdfjsLib
		const { renderTextLayer } = window.pdfjsLib;

		// Cancel any existing render task before creating a new one
		render_task?.cancel();

		// Start rendering the text layer
		render_task = renderTextLayer({
			container,
			textContentSource: await page.getTextContent(), // Get text content from the page
			viewport,
			textDivs: [] // Optionally pass text divs array for more customization
		});

		// Add error handling for rendering task
		try {
			await render_task.promise;
		} catch (error) {
			if (error.name !== 'RenderingCancelledException') {
				console.error('Error rendering text layer:', error);
			}
		}
	}

	// Reactively call render_text_layer whenever the container, viewport, or page changes
	$: if (BROWSER && container && viewport) render_text_layer();
</script>

<!-- Container div that holds the text layer elements -->
<div bind:this={container}></div>

<style>
	div {
		position: absolute;
		inset: 0;
		overflow: clip;
		opacity: 0.8; /* Adjust opacity to make the text layer more visible */
		line-height: 1;
	}

	div > :global(span) {
		color: transparent;
		position: absolute;
		white-space: pre;
		cursor: text;
		transform-origin: 0% 0%;
	}
</style>
