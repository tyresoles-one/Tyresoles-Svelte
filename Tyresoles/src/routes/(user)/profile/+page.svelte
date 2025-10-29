<script lang="ts">
	import { onMount } from '$lib';
	import { PageWindow, Avatar  } from '$lib/components';
	import { loadingStore, userStore } from '$lib/managers/stores';
	import { IMAGES } from '$lib/managers/network';
	import type {userLocation} from '$lib/business/models';
	import { on } from 'svelte/events';

	const name = $userStore?.locations.find((l) => l.default === true)?.userName ?? ''
	const avatar = IMAGES[$userStore?.avatar || 0]?.url;
	const title = $userStore?.locations.find((l) => l.default === true)?.userTitle ?? '';
	let userData = $state<userLocation | null>(null);

	onMount(async () => {
		userData = $userStore?.locations.find((l) => l.default === true) ?? null;
	});	

	const getInitials = (name: string) => {
		if (!name) return '';
		return name
			.split(' ')
			.map((part) => part.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('');
	};
</script>
<PageWindow loading={$loadingStore}>
	<div class="p-4 flex flex-col justify-center items-center gap-4">
		<div>
			<Avatar.Root class="h-14 w-14 rounded-lg">
				<Avatar.Image src={avatar} alt={name} />
				<Avatar.Fallback class="rounded-lg">{getInitials(name)}</Avatar.Fallback>
			</Avatar.Root>		
		</div>
		<div class="mb-4 flex flex-col gap-1 w-full border border-gray-300 shadow-md rounded-md">
			<table class="w-full text-left text-gray-500 table-auto">
				<tbody class="p-4">
					<tr class="border-b border-gray-300 dark:border-gray-700">
						<td class="px-4 py-4 bg-gray-100">Name</td>
						<td class="px-4 py-4">{userData?.userName}</td>
					</tr>
					<tr class="border-b border-gray-300 dark:border-gray-700"> 
						<td class="px-4 py-4 bg-gray-100">Title</td>
						<td class="px-4 py-4">{userData?.userTitle}</td>
					</tr>
					<tr class="border-b border-gray-300 dark:border-gray-700"> 
						<td class="px-4 py-4 bg-gray-100">Code</td>
						<td class="px-4 py-4">{userData?.userCode}</td>
					</tr>
					<tr class="border-b border-gray-300 dark:border-gray-700"> 
						<td class="px-4 py-4 bg-gray-100">Resp. Center</td>
						<td class="px-4 py-4">{userData?.respName}</td>
					</tr>
				</tbody>				
			</table>			
		</div>
	</div>
</PageWindow>

