<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '../icon/icon.svelte';
	import { DropdownMenu } from '../dropdown-menu';
	import type { Menu, MenuItem } from '../types';

	let { menuItems = [], disabled = false } = $props<{
		menuItems?: Array<MenuItem>;
		disabled?: boolean;
	}>();

	let menu: Menu = $state({
		label: 'Select Report',
		items: menuItems
	});
</script>

<DropdownMenu {menu} {disabled}>
	<Icon name="Files" class="h-5 w-5" />
	<span class="mx-0">Reports</span>
</DropdownMenu>
