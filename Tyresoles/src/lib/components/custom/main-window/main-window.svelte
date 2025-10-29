<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from './side-bar.svelte';
	import Essentials from './essentials.svelte';
	import Gaurd from './gaurd.svelte';
	import { set_pdfjs_context } from '../pdf-viewer/utils/vite';

	let { children }: { children: Snippet } = $props();
	set_pdfjs_context();
</script>

<Gaurd />
<Essentials />
<Sidebar>
	{@render children?.()}
</Sidebar>
