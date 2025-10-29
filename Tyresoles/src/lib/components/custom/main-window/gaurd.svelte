<script lang="ts">
	import { goto } from '$lib';
	import { userStore } from '$lib/managers/stores';
	$effect(() => {
		if (!$userStore) {
			goto('/login');
		}else{
			if($userStore.homePath) goto($userStore.homePath);
		}
	});
</script>

<div></div>
