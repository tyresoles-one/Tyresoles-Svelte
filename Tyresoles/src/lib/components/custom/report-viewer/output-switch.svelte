<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '../icon/icon.svelte';
	import { DropdownMenu } from '../dropdown-menu';
	import type { Menu } from '../types';

	let {
		reportOutput = $bindable('PDF'),
		disabled = false,
		isExcel = true
	} = $props<{
		reportOutput: 'PDF' | 'Excel';
		disabled?: boolean;
		isExcel?: boolean;
	}>();

	let menu: Menu = $state({
		label: 'Select Output Format',
		items: [
			{
				label: 'PDF',
				icon: 'FileText',
				checked: reportOutput === 'PDF',
				onClick: () => {
					reportOutput = 'PDF';
				}
			},
			{
				label: 'Excel',
				icon: 'Sheet',
				checked: reportOutput === 'Excel',
				onClick: () => {
					reportOutput = 'Excel';
				}
			}
		]
	});

	onMount(() => {
		if (!isExcel) {
			menu.items = menu?.items?.filter((item) => item.label !== 'Excel');
		}
	});
</script>

<DropdownMenu {menu} {disabled}>
	<Icon name={reportOutput === 'PDF' ? 'FileText' : 'Sheet'} class="h-5 w-5" />
	<span>{reportOutput}</span>
</DropdownMenu>
