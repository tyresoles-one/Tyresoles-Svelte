<script lang="ts">
    import {tempFetchParamsStore} from '$lib/managers/stores';
    import {ReportViewer} from '$lib/components';
    import { apiFetch, endpoints } from '$lib/managers/network';
    let endpoint = endpoints.sales.salesReport;    
    
</script>
<ReportViewer fetchParam={$tempFetchParamsStore} {endpoint} closePath='\salesdocs' />