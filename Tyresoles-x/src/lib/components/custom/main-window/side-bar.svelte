<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '../side-bar/app-sidebar.svelte';
	import type { Snippet } from 'svelte';
	import { settingsStore } from '$lib/managers/stores';
	import { SIDEBAR_OPEN_TIMEOUT } from '$lib/system';
	import Topbar from '../top-bar/topbar.svelte';

	let { children }: { children: Snippet } = $props();

	let open = $state<boolean>(false);
	let isActive = $state<boolean>(false);
	let timer: NodeJS.Timeout | null = null;
	let activityTimer: NodeJS.Timeout | null = null;

	const clearTimer = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};

	const clearActivityTimer = () => {
		if (activityTimer) {
			clearTimeout(activityTimer);
			activityTimer = null;
		}
	};

	const startAutoCloseTimer = () => {
		if ($settingsStore?.enableSidebarAutoClose) {
			clearTimer();
			timer = setTimeout(() => {
				if (!isActive) {
					open = false;
				}
			}, $settingsStore?.sidebarOpenTimeout ?? SIDEBAR_OPEN_TIMEOUT);
		}
	};

	$effect(() => {
		if (!$settingsStore?.enableSidebarAutoClose) {
			return;
		}

		if (open) {
			if (isActive) {
				clearTimer();
				clearActivityTimer();
				activityTimer = setTimeout(() => {
					isActive = false;
					startAutoCloseTimer();
				}, 3000);
			} else {
				startAutoCloseTimer();
			}
		} else {
			clearTimer();
			clearActivityTimer();
		}
	});
</script>

<Sidebar.Provider class="bg-muted/100" bind:open>
	<AppSidebar bind:isActive />
	<Sidebar.Inset class={' w-screen px-[var(--safe-area-left)] pb-[var(--safe-area-bottom)]'}>
		<Topbar />
		<div class="flex-1 overflow-auto p-1">
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
