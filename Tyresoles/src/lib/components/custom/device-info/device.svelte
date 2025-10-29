<script lang="ts">
	import {
		getBrowserInfo,
		getOSInfo,
		isRunningInStandaloneMode
	} from '$lib/managers/services/device';
	import * as Alert from '$lib/components/ui/alert/index';
	import Icon from '../icon/icon.svelte';

	import { onMount } from 'svelte';

	let osInfo = 'Unknown';
	let browserInfo;
	let installed;

	onMount(() => {
		osInfo = getOSInfo();
		browserInfo = getBrowserInfo();
		installed = isRunningInStandaloneMode();
	});
</script>

<Alert.Root>
	<Icon name="MonitorSmartphone" class="h-4 w-4" />

	<Alert.Title>Platform Details</Alert.Title>
	<Alert.Description>
		<div class="flex gap-2">
			<span>OS : <b>{osInfo}</b></span>
			<span>Browser : <b>{browserInfo?.name},</b> <b>{browserInfo?.version}</b></span>
			<span>Installed : <b>{installed === true ? 'Yes' : 'No'}</b></span>
		</div>
	</Alert.Description>
</Alert.Root>
