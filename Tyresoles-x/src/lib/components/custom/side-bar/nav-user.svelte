<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';

	import Icon from '../icon/icon.svelte';
	import type { NavUserProps } from '$lib/components/custom/types';

	const sidebar = useSidebar();

	let { avatar, name, title, menus }: NavUserProps = $props();

	const getInitials = (name: string) => {
		if (!name) return '';
		return name
			.split(' ')
			.map((part) => part.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('');
	};
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						{@render userAvatar(avatar as string, name as string, title as string)}

						<Icon name="ChevronsUpDown" class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						{@render userAvatar(avatar as string, name as string, title as string)}
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				{#if menus}
					<DropdownMenu.Group>
						{#each menus as menu}
							{#if menu.seperator}
								<DropdownMenu.Separator />
							{:else}
								<DropdownMenu.Item onclick={menu.onClick}>
									{#if menu.icon}
										<Icon name={menu.icon} />
									{/if}
									{menu.label}
								</DropdownMenu.Item>
							{/if}
						{/each}
					</DropdownMenu.Group>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>

{#snippet userAvatar(image: string, name: string, title: string)}
	<Avatar.Root class="h-8 w-8 rounded-lg">
		<Avatar.Image src={image} alt={name} />
		<Avatar.Fallback class="rounded-lg">{getInitials(name)}</Avatar.Fallback>
	</Avatar.Root>
	<div class="grid flex-1 text-left text-sm leading-tight">
		<span class="truncate font-semibold">{name}</span>
		<span class="truncate text-xs">{title}</span>
	</div>
{/snippet}
