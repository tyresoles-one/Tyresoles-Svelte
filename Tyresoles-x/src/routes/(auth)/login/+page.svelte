<script lang="ts">
	import { goto } from '$app/navigation';
	import { Form, type InputProps, type ButtonProps, PageWindow } from '$lib/components';
	import { IMAGES, apiFetch, getURLSearchParams, endpoints } from '$lib/managers/network';
	import dayjs from 'dayjs';
	import {
		loadingStore,
		userStore,
		fetchParamsStore,
		setDefaultSettings,
		settingsStore
	} from '$lib/managers/stores';
	import { prepareFetchParams } from '$lib/business/models/auth';
	import { required } from '$lib/managers/services/validation';
	import { isTauri } from '$lib/system';

	let data = $state({
		userId: '',
		password: '',
		mode: isTauri ? 'ERPApp' : 'WebApp'
	});
	let fields: InputProps[] = [
		{
			name: 'userId',
			type: 'text',
			label: 'User ID',
			icon: 'User',
			description: 'Reg. Mobile No. / ERP Code',
			rules: [required('User ID')],
			onfocusout: (event) => {
				if (data && data.userId && data.userId.toLowerCase().startsWith('ts:')) {
					data.userId = data.userId.replace('ts:', 'TYRESOLES\\');
				}
			}
		},
		{
			name: 'password',
			type: 'password',
			label: 'Password',
			icon: 'Lock',
			rules: [required('Password')]
		},
		{ name: 'mode', type: 'text', label: 'Mode', hidden: true, rules: [required('Mode')] }
	];
	let actions: ButtonProps[] = [
		{
			label: 'Login',
			icon: 'KeyRound',
			loading: $loadingStore,
			type: 'submit'
		},
		{
			label: 'Forgot Password',
			variant: 'ghost',
			onclick: () => {
				goto('/forgotpass');
			}
		}
	];
</script>

<PageWindow>
	<div class="mt-0 sm:m-0 md:mt-2 lg:mt-2">
		<Form
			class="mx-auto w-full max-w-md"
			layoutClass="flex flex-col gap-4 p-4"
			title="Login"
			description="Login to your account"
			image={IMAGES.find((i) => i.name === 'login-cover')?.url}
			icon="Key"
			loading={$loadingStore}
			{fields}
			{actions}
			bind:data
			onSubmit={(data) => {
				apiFetch(
					`${endpoints.auth.login}?${getURLSearchParams(data as Record<string, string>).toString()}`,
					{
						method: 'POST'
					}
				).then((res) => {
					if (res.success) {
						goto(res.data?.homePath ?? '/');
						userStore.set(res.data);
						fetchParamsStore.set(prepareFetchParams(res.data));
						if (res.data.homePath) {
							settingsStore.set({ ...$settingsStore, homePath: res.data.homePath });
						}
						settingsStore.update((s) => ({
							...s,
							respCode: res.data.locations.find((l) => l.default === true)?.respCode,
							workDate: dayjs(res.data.workDate).format('DD-MMM-YYYY')
						}));
					}
				});
			}}
		></Form>
	</div>
</PageWindow>
