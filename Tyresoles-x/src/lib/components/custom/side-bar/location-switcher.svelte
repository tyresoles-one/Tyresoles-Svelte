<script lang="ts">
	import type { LocationSwitcherProps } from '$lib/components/custom/types';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Icon } from '$lib/components/custom/icon';
	import { BACKEND_SERVER_IP } from '$lib/system';
	let { company, location = $bindable(), locations = [] }: LocationSwitcherProps = $props();
	let logo = $derived(locations.find((loc) => loc.label === location)?.logo ?? 'logo');
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<div
							class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
						>
							<div class="size-6 text-white dark:text-black">
								<img
									src={`${BACKEND_SERVER_IP}/images/${logo}.svg`}
									alt={company}
									class="fill-current"
								/>
							</div>
						</div>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{company}</span>
							<span class="truncate text-xs">{location}</span>
						</div>
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			{#if locations.length}
				<DropdownMenu.Content class="w-[--bits-dropdown-menu-anchor-width]" align="start">
					{#each locations as loc}
						<DropdownMenu.Item
							onclick={() => {
								console.log(loc);
								location = loc.label;
							}}
						>
							{loc.label}
							{#if location === loc.label}
								<Icon name="Check" class="ml-auto size-4" />
							{/if}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			{/if}
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
