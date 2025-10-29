<script lang="ts">
	import { Button } from '$lib/components/custom/button';
	import { Icon } from '$lib/components/custom/icon';
	import { DEFAULT_ERROR_MESSAGE } from '$lib/system';
	import { pageStore as page } from '$lib';
</script>

<div
	class="m-3 flex flex-col items-center justify-center rounded-md border-slate-400 bg-white p-5 shadow-md lg:m-6"
>
	<div class="mb-5 mt-2">{DEFAULT_ERROR_MESSAGE}</div>
	<div>{$page.status}</div>
	<span class="text-4xl">{`${$page.status === 404 ? 'Page not found' : 'Internal Error'}`}</span>
	<span class="m-2">Sorry, we couldn’t find the page you’re looking for.</span>
	<div class="m-10 flex flex-col gap-5 sm:flex-row">
		<Button href="/">
			Go back home
			<Icon class="ml-3 h-5 w-5" name="Home" />
		</Button>
		<Button href="/support" variant="outline">
			Contact support
			<Icon class="ml-3 h-5 w-5" name="Headset" />
		</Button>
	</div>
</div>
