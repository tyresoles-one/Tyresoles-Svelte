<script lang="ts">
	import { DeviceInfo, Button } from '$lib/components';
</script>

<div class="flex flex-col gap-2 p-2">
	<DeviceInfo />
	<Button
		icon="MessageSquareText"
		onclick={() => {
			window.open('https://forms.gle/VzHKkAQYwVo2TJij6', '_blank', 'noopener noreferrer');
		}}><span class="ml-2">Open Feedback Form</span></Button
	>
</div>
