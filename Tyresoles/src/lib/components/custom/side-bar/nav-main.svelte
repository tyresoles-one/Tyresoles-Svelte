<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { ChevronRight } from '@lucide/svelte';
	import { Icon } from '$lib/components/custom/icon';
	import type { NavItemProps } from '$lib/components/custom/types';
	let { items, searchTerm }: { items: Array<NavItemProps>; searchTerm: string | undefined } =
		$props();

	function filterNavItems(navItems: NavItemProps[], searchTerm: string): NavItemProps[] {
		return navItems
			.map((navItem) => {
				// Filter children recursively
				const filteredChildren = navItem.items ? filterNavItems(navItem.items, searchTerm) : [];

				// Check if parent title matches or if any child matches
				if (
					navItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					filteredChildren.length > 0
				) {
					return { ...navItem, items: filteredChildren };
				}
				return null;
			})
			.filter((navItem) => navItem !== null); // Remove null values
	}

	let filteredItems = $derived(
		searchTerm
			? //? items.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
				filterNavItems(items, searchTerm)
			: items
	);

	const sidebar = Sidebar.useSidebar();
	const handleClick = () => {
		sidebar.toggle();
	};
</script>

<Sidebar.Group>
	<Sidebar.Menu>
		{#each filteredItems as mainItem (mainItem.title)}
			{#if mainItem.items && mainItem.items?.length > 0}
				<Collapsible.Root open={mainItem.isActive} class="group/collapsible">
					{#snippet child({ props })}
						<Sidebar.MenuItem {...props}>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuButton {...props}>
										{#snippet tooltipContent()}
											{mainItem.title}
										{/snippet}
										{#if mainItem.icon}
											<Icon name={mainItem.icon} />
										{/if}
										{#if mainItem.url}
											<a href={mainItem.url}>
												<span>{mainItem.title}</span>
											</a>
										{:else}
											<span>{mainItem.title}</span>
										{/if}
										<ChevronRight
											class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
										/>
									</Sidebar.MenuButton>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								{#if mainItem.items}
									<Sidebar.MenuSub>
										{#each mainItem.items as subItem (subItem.title)}
											<Sidebar.MenuSubItem onclick={handleClick}>
												<Sidebar.MenuSubButton>
													{#snippet child({ props })}
														<a href={subItem.url} {...props}>
															{#if subItem.icon}
																<Icon name={subItem.icon} class="size-3 text-slate-400" />
															{/if}
															<span>{subItem.title}</span>
														</a>
													{/snippet}
												</Sidebar.MenuSubButton>
											</Sidebar.MenuSubItem>
										{/each}
									</Sidebar.MenuSub>
								{/if}
							</Collapsible.Content>
						</Sidebar.MenuItem>
					{/snippet}
				</Collapsible.Root>
			{:else}
				<Sidebar.MenuItem onclick={handleClick}>
					<Sidebar.MenuButton>
						{#snippet tooltipContent()}
							{mainItem.title}
						{/snippet}
						{#if mainItem.icon}
							<Icon name={mainItem.icon} />
						{/if}
						{#if mainItem.url}
							<a href={mainItem.url}>
								<span>{mainItem.title}</span>
							</a>
						{:else}
							<span>{mainItem.title}</span>
						{/if}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/if}
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>

<!-- <Sidebar.Group>
	<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root open={mainItem.isActive}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						<Sidebar.MenuButton>
							{#snippet tooltipContent()}
								{mainItem.title}
							{/snippet}
							{#snippet child({ props })}
								<a href={mainItem.url} {...props}>
									<mainItem.icon />
									<span>{mainItem.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						{#if mainItem.items?.length}
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction {...props} class="data-[state=open]:rotate-90">
										<ChevronRight />
										<span class="sr-only">Toggle</span>
									</Sidebar.MenuAction>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub>
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton href={subItem.url}>
												<span>{subItem.title}</span>
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							</Collapsible.Content>
						{/if}
					</Sidebar.MenuItem>
				{/snippet}
			</Collapsible.Root>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group> -->
