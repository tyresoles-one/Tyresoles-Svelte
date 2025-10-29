<script lang="ts">
	import { icons } from '@lucide/svelte';
	import type { RibbonTab, RibbonControl } from '../types';

	let { tabs = [] } = $props<{
		tabs: RibbonTab[];
	}>();

	let activeTabId = $state(tabs[0]?.id || '');

	const activeTab = $derived.by<RibbonTab>(() => tabs.find((tab) => tab.id === activeTabId));

	function handleTabClick(tabId: string) {
		activeTabId = tabId;
	}

	function handleControlClick(control: RibbonControl) {
		console.log('Control Clicked', control);
	}

	function handleInputChange(event: Event, control: RibbonControl) {
		const target = event.target as HTMLInputElement;
		control.value = target.value;
		console.log('input change', control);
	}
</script>

<nav class="border-b border-gray-200 bg-gray-100">
	<div class="flex overflow-x-auto">
		{#each tabs as tab (tab.id)}
			<button
				class="text-smtext-gray-700 border-b-2 px-4 py-1 hover:bg-gray-200 focus:outline-none {activeTabId ===
				tab.id
					? 'border-blue-500'
					: 'border-transparent'}"
				class:border-blue-500={activeTabId === tab.id}
				class:border-transparent={activeTabId !== tab.id}
				onclick={() => handleTabClick(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	{#if activeTab}
		<div class="flex flex-wrap space-x-4 p-4">
			{#each activeTab?.groups as group (group.id)}
				<div class="flex flex-col border-r border-gray-300 pr-4 last:border-r-0">
					{#if group.label}
						<span class="pb-1 pl-1 text-sm font-medium text-gray-500">{group.label}</span>
					{/if}
					<div class="flex space-x-2">
						{#each group.controls as control (control.id)}
							{#if control.type === 'button'}
								<button
									class="rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									onclick={() => handleControlClick(control)}
								>
									{#if control.icon}
										<i class={control.icon}></i>
									{/if}
									{control.label}
								</button>
							{:else if control.type === 'toggle'}
								<button
									class="rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									onclick={() => handleControlClick(control)}
									class:bg-blue-400={control.value}
								>
									{#if control.icon}
										<i class={control.icon}></i>
									{/if}
									{control.label}
								</button>
							{:else if control.type === 'dropdown'}
								<select
									class="rounded-md border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none"
									value={control.value}
									onchange={(event) => handleInputChange(event, control)}
								>
									{#each control?.options as option}
										<option value={option?.value}>{option?.label}</option>
									{/each}
								</select>
							{:else if control.type === 'input'}
								<input
									type="text"
									class="rounded-md border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none"
									placeholder={control.label}
									value={control.value || ''}
									oninput={(event) => handleInputChange(event, control)}
								/>
							{:else if control.type === 'separator'}
								<div class="ml-2 h-full border-r border-gray-300"></div>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</nav>
