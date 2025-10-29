<script lang="ts">
    import {apiFetch, endpoints, getURLSearchParams} from '$lib/managers/network'
    import {onMount} from '$lib';
    import { Input, PageWindow, Button, toast, Grid } from '$lib/components';
    import {loadingStore} from '$lib/managers/stores';
    import type {InvoiceMapper, InvLineMapper} from '$lib/business/models';


    let data = $state<InvoiceMapper>({
        oldCompany: '',
        invoiceNo: ''
    });
    let lineData = $state<InvLineMapper>({
        lineNo:0,
        tyre: '',
        serialNo: '',
        make: '',
        date:'',
        invNo:'',
        oldCompany:'',
    });
    let selected = $state<Map<string,object>>(new Map());
    let companies = $state<[{code:string, value: string}]>();
    let records = $state<any[]>([]);

    onMount(()=>{
        let data: Record<string,string> = {
            business: 'tyre'            
        };
        apiFetch(`${endpoints.merger.oldCompanies}?${getURLSearchParams(data as Record<string, string>).toString()}`,{
            method:'GET'
        }).then(resp=>{
            if (resp.success){
                companies = resp.data.map((x:string)=> ({code: x, value:x}));
            }
        });
    });
    const handleGetDetails = () => {
        if (data.oldCompany && data.invoiceNo){
            records = [];
            apiFetch(endpoints.merger.getOldInvLines,{
                method: 'POST',
                body: data
            }).then(resp=>{
                if (resp.success){
                  records = resp.data;
                } 
            })
        } else {
            toast.error('Please select company and enter invoice no');
        }
    }
    const handleCreateClaim = () => {
        if(selected.size === 0){
            toast.error('Please select a record to create claim request');
            return;
        }
        if(selected.size > 1){
            toast.error('Please select only one record to create claim request');
            return;
        }
        let line = Array.from(selected.values())[0] as InvLineMapper;
        apiFetch(endpoints.merger.createClaimOnOldInv,{
            method: 'POST',
            body: line
        }).then(resp=>{
            if (resp.success){
                toast.success(`Claim ${resp.data} created successfully`);                
                selected.clear();
            }
        })
    }
    $inspect(selected, 'selected');
</script>
<PageWindow loading={$loadingStore}>
    <div class="flex gap-2 border border-gray-400 rounded-md p-2">
        <Input type='list' 
            data={companies} hideHeader columns={[{name: 'code'}]} 
            dataKey='code' labelKey='code' valueKey='code'
            label='Select Company' bind:value={data.oldCompany}
        />
        <Input type='text' label='Invoice No' bind:value={data.invoiceNo} />
        <Button label="Get Details" class="mt-6" onclick={handleGetDetails}/>
    </div>
    <div class="mt-4">
        {#if records.length === 0}
            <div class="text-center text-gray-500">No records to display</div>
        {:else}
        <Grid 
            actions={[{label: 'Create Claim', onclick: handleCreateClaim}]}
            enableSelection dataKey='lineNo' 
            onSelectionChange={selection => selected = selection}
            data={records} selectionType='single' 
            columns={[{name:'tyre', label:'Tyre'},{name:'serialNo', label:'Serial No'},{name: 'make', label:'Make'}]}/>
        {/if}
    </div>
</PageWindow>