<script lang="ts">
	import logo from '$lib/assets/logo.png';
	import { ModeSwitch } from '$lib/components/custom/mode-switch';
	import { Notification } from '$lib/components/custom/notification';
	import { Sidebar, Separator } from '$lib/components';
	import { userStore, settingsStore } from '$lib/managers/stores';
	import { PROJECT_NAME, PUBLIC_PATHS } from '$lib/system';
	import { cn } from '$lib/components';
	import { pageStore, goto } from '$lib';
	import { Button } from '$lib/components/custom/button';

	const blankPaths = [...PUBLIC_PATHS, '/'];

	$effect(() => {
		let activePage: string | undefined = undefined;
		if (blankPaths.includes($pageStore.url.pathname)) {
			activePage = '';
		} else {
			let pages: Array<{ title: string; path: string }> = [
				{ title: 'Support', path: '/support' },
				{ title: 'Profile', path: '/profile' },
				{ title: 'Settings', path: '/settings' }
			];
			pages = [
				...pages,
				...($userStore?.menus.map((m) => ({ title: m.title, path: m.action })) ?? [])
			];
			const page = pages.find((p) => p.path === $pageStore.url.pathname);
			if (page) {
				activePage = page.title;
			}
		}
		if (activePage !== undefined) {
			settingsStore.update((s) => ({
				...s,
				activePage
			}));
		}
	});
</script>

<header
	class={cn(
		'flex h-12 shrink-0 justify-between rounded-sm',
		'bg-gradient-to-r from-[#be93c5] to-[#7bc6cc]',
		'px-[var(--safe-area-left)] pt-[var(--safe-area-top)]',
		$userStore && 'mr-0'
	)}
>
	<div class="flex">
		{#if $userStore}
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-2" />
				<Separator orientation="vertical" class="mr-1 h-4" />
			</div>
		{:else}
			<div class="flex gap-2 px-4 py-1">
				<img
					src={logo}
					alt={PROJECT_NAME}
					class="h-9 w-9 pt-1 transition-all group-hover:scale-110"
				/>
				<span class="align-middle font-['Cambria'] text-4xl uppercase tracking-wider text-slate-100"
					>{PROJECT_NAME}</span
				>
			</div>
		{/if}
	</div>
	{#if $userStore && $settingsStore?.backPath && $pageStore.url.pathname !== $settingsStore?.backPath}
		<div class="-ml-4 flex items-center justify-end gap-2 pr-2">
			<Button
				variant="ghost"
				icon="Undo2"
				onclick={() => {
					goto($settingsStore?.backPath ?? '/');
				}}
			/>
		</div>
	{/if}
	<div class="flex flex-1 items-center justify-center gap-2">
		<span class="text-md mr-auto font-semibold">{$settingsStore?.activePage}</span>
	</div>
	<div class="flex items-center justify-end gap-2 pr-2">
		{#if $userStore}			
			<Button
				variant="ghost"
				icon="Home"
				onclick={() => {
					goto($userStore?.homePath ?? '/');
				}}/>
			<Notification count={0} />
		{/if}
		<ModeSwitch />
	</div>
</header>
