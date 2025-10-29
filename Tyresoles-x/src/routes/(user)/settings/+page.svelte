<script lang="ts">
    import {Input, PageWindow, toast} from '$lib/components';
    import {userStore, loadingStore} from '$lib/managers/stores';
	import {apiFetch, endpoints, getURLSearchParams} from '$lib/managers/network';

</script>
<PageWindow loading={$loadingStore}>

    <div class="p-4">
        <Input type='list' label="Select Home Path" value={$userStore?.homePath} hideHeader data={$userStore?.menus.filter(f=>f.action !== '')} columns={[{
            name:'title'
        }]}        
        disabled={$loadingStore}
        valueKey='action'
        labelKey='title'
        dataKey='action'
         onInput={(values, selection) => {
            let data = {
                userId: $userStore?.id || '',
                homePath: values
            }
            apiFetch(
					`${endpoints.user.changeHomePath}?${getURLSearchParams(data as Record<string, string>).toString()}`,
					{
						method: 'POST'
					}
			).then((resp) => {
                if(resp.success)
                {
                    toast.success("Home Path save successfully.");
                }
            });            
        }}/>
    </div>
</PageWindow>