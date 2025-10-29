<script lang="ts">
	import LocationSwitcher from '$lib/components/custom/side-bar/location-switcher.svelte';
	import Search from '$lib/components/custom/side-bar/search.svelte';
	import NavMain from '$lib/components/custom/side-bar/nav-main.svelte';
	import NavUser from '$lib/components/custom/side-bar/nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { PROJECT_NAME } from '$lib/system';
	import { IMAGES } from '$lib/managers/network';
	import { userStore, clearAll, settingsStore } from '$lib/managers/stores';
	import { dialogShow, dialogHide } from '$lib/components/custom/dialog';
	import { goto } from '$app/navigation';
	import { convertMenuToNavItems } from './logic';
	import type { NavItemProps } from '$lib/components/custom/types';
	const sidebar = Sidebar.useSidebar();
	let {
		ref = $bindable(null),
		isActive = $bindable(),
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { isActive: boolean } = $props();
	let location = $state(
		$userStore?.locations.find((l) => l.default === true)?.respName ?? 'Belgaum'
	);
	let locations = $derived(
		$userStore?.locations.map((l) => ({ code: l.respCode, label: l.respName, logo: 'logo' }))
	);
	let searchTerm = $state<string>('');
	const handleUserActivity = () => {
		isActive = true;
	};
	let items = $derived<NavItemProps[]>(convertMenuToNavItems($userStore?.menus ?? []));
	$effect(() => {
		settingsStore.update((s) => ({
			...s,
			respCode: $userStore?.locations.find((l) => l.respName === location)?.respCode
		}));
	});
	//$inspect(items, 'items');
</script>

{#if $userStore}
	<Sidebar.Root
		bind:ref
		variant="inset"
		{...restProps}
		onmousemove={handleUserActivity}
		onclick={handleUserActivity}
		onscroll={handleUserActivity}
		ontouchstart={handleUserActivity}
		onkeydown={handleUserActivity}
		onmouseenter={handleUserActivity}
		onmouseleave={() => (isActive = false)}
	>
		<Sidebar.Header>
			<LocationSwitcher company={PROJECT_NAME} bind:location {locations} />
			<Search bind:searchTerm />
		</Sidebar.Header>
		<Sidebar.Content>
			<NavMain items={convertMenuToNavItems($userStore?.menus)} {searchTerm} />
		</Sidebar.Content>
		<Sidebar.Footer>
			<NavUser
				name={$userStore.locations.find((l) => l.default === true)?.userName ?? ''}
				avatar={IMAGES[$userStore.avatar].url}
				title={$userStore.locations.find((l) => l.default === true)?.userTitle ?? ''}
				menus={[
					{
						label: 'Profile',
						icon: 'User',
						onClick: () => {
							sidebar.toggle();
							goto('/profile');
						}
					},
					{
						label: 'Settings',
						icon: 'Settings',
						onClick: () => {
							sidebar.toggle();
							goto('/settings');
						}
					},
					{
						label: 'Support',
						icon: 'LifeBuoy',
						onClick: () => {
							sidebar.toggle();
							goto('/support');
						}
					},
					{
						seperator: true
					},
					{
						label: 'Log out',
						icon: 'LogOut',
						onClick: () => {
							sidebar.toggle();
							dialogShow({
								title: 'Log out',
								description: 'Are you sure you want to log out?',
								actionLabel: 'Log out',
								onAction: () => {
									clearAll();
									dialogHide();
									goto('/login');
								}
							});
						}
					}
				]}
			/>
		</Sidebar.Footer>
	</Sidebar.Root>
{/if}
