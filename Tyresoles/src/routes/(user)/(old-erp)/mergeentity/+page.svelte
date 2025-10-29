<script lang="ts">
    import {onMount} from '$lib'
    import {apiFetch, endpoints, getURLSearchParams} from '$lib/managers/network'
    import {loadingStore} from '$lib/managers/stores'
    import {Input, PageWindow, Button, toast} from '$lib/components'
    import type {EntityMapper} from '$lib/business/models'

    let companies = $state<[{code:string, value: string}]>();
    let respCenters = $state<[{code:string, value: string}]>();
    let partyTypes = $state<Array<{code:string, value: string}>>([
        {code:'Customer', value:'Customer'},
        {code:'Vendor', value:'Vendor'}
    ]);
    let record = $state<EntityMapper>({
        newCode: '',
        oldCode: '',
        type:'',
        oldCompany: '',
        oldRespCenter: '',
        name: '',        
    });
    onMount(()=>{
        let data: Record<string,string> = {
            business: 'tyre'            
        };
        apiFetch(`${endpoints.merger.oldCompanies}`,{
            method:'GET'
        }).then(resp=>{
            if (resp.success){
                companies = resp.data.map((x:string)=> ({code: x, value:x}));
            }
        });
    });

</script>
<PageWindow loading={$loadingStore}>
    <div class="flex gap-2 p-4">
        <Input type='list' 
            bind:value={record.oldCompany}
            data={companies} hideHeader columns={[{name: 'code'}]} 
            dataKey='code' labelKey='code' valueKey='code'
            label='Old Company'
            onselectionchange={selection =>{
                const company = selection?.target?.value;
                if(company){
                    apiFetch(`${endpoints.merger.oldRespCenters}?${getURLSearchParams({company})}`,{
                        method:'GET'
                    }).then(resp=>{
                        if (resp.success){
                            respCenters = resp.data.map((x:string)=> ({code: x, value:x}));
                        }
                    })
                }
            }} 
        />
        <Input type='list' 
            bind:value={record.oldRespCenter}
            data={respCenters} hideHeader columns={[{name: 'code'}]} 
            dataKey='code' labelKey='code' valueKey='code'
            label='Old Resp Center'/>
        <Input type='list' 
            bind:value={record.type}
            data={partyTypes} hideHeader columns={[{name: 'code'}]} 
            dataKey='code' labelKey='code' valueKey='code'
            label='Party Type'/>
        <Input type='text' label='Party Code' bind:value={record.oldCode}/>    
        <Button class="mt-6" label='Check' onclick={()=>{
            apiFetch(endpoints.merger.getMapper,{
                method: 'POST',
                body: record
            }).then(resp=>{
                if (resp.success){
                    record = resp.data;
                }
            })
        }}/>    
       
    </div>
    {#if record.name}
     <div class="p-4 flex flex-col">
        <table class="table-auto">
            <thead class="bg-gray-100 border-b border-gray-400">
                <tr class="text-left px-4 py-2">
                    <th>Name</th>
                    {#if record.newCode}
                     <th >New Code</th>
                    {:else}
                     <th>Action</th>
                    {/if}                    
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-gray-300">
                    <td class="my-4">{record.name}</td>
                    {#if record.newCode}
                        <td >{record.newCode}</td>
                    {:else}    
                        <td >
                            <Button label="Create New Code" onclick={()=>{
                                apiFetch(endpoints.merger.prepareEntity,{
                                    method: 'POST',
                                    body:record
                                }).then((resp)=>{
                                    if(resp.success)
                                    {
                                        toast.success(`New code ${resp.data} created successfully`);
                                    }
                                })
                            }} />
                        </td>
                    {/if}
                </tr>
            </tbody>
        </table>
    </div>
    {/if}
</PageWindow>