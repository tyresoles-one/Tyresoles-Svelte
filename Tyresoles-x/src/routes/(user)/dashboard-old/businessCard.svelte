<script lang="ts">
    import {Toggle} from '$lib/components/ui/toggle';
    import type {BusinessCardProps} from './logic'

    let {
        businessLoc =$bindable(),
        children,
    } = $props<BusinessCardProps>();
</script>
<div class="p-2 border border-gray-300 bg-slate-600 rounded-lg mb-4 w-full ">
    <div class="flex justify-between border-b border-gray-500 text-gray-900 font-bold p-1 rounded tracking-wide uppercase ">
        <div class="font-bold text-slate-900 text-white text-lg">{businessLoc.business}</div>
        <div class="flex gap-2">
            {#each businessLoc.locations as loc}
                <Toggle variant='outline' class="text-white" pressed={businessLoc.selections.includes(loc)} onPressedChange={(pressed)=>{
                    if(pressed){
                        businessLoc.selections.push(loc);
                    }else{
                        businessLoc.selections = businessLoc.selections.filter(s => s !== loc);
                    }
                }}>
                    {loc}
                </Toggle>
            {/each}
        </div>
    </div>
    <div>
        {@render children?.()}
    </div>
</div>