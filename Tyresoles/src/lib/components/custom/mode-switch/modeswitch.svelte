<script lang="ts">
	import { Icon } from '$lib/components/custom/icon';
	import { Button } from '$lib/components/custom/button';
	import { toggleMode } from 'mode-watcher';
</script>

<Button variant="ghost" size="icon" onclick={toggleMode} class="overflow-hidden">
	<Icon name="Sun" class="scale-100 transition-all dark:-rotate-90 dark:scale-0" />
	<Icon
		name="Moon"
		class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
	/>
</Button>
