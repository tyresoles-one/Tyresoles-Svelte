import type { FetchParams } from '$lib/business/models';
import { endpoints, apiFetch } from '$lib/managers/network';
import { fetchParamsStore, vendorStore, itemsStore, makesStore, 
    inspectorsStore, procInspectionsStore, statesStore, marketsStore } from '$lib/managers/stores';
import { getStore } from '$lib';
import {toast} from '$lib/components';


export const fetchMasters = () => {
    Promise.all([
        fetchVendors(),
        fetchItems(),
        fetchMakes(),
        fetchInspectors(),
        fetchProcInspections()])    
        .then(([resVender, resItems, resMakes, 
            resInspectors, resProcInspections]) => {
                if(resVender?.success) vendorStore.set(resVender.data);
                if(resItems?.success) itemsStore.set(resItems.data);
                if(resMakes?.success) makesStore.set(resMakes.data);
                if(resInspectors?.success) inspectorsStore.set(resInspectors.data);
                if(resProcInspections?.success) procInspectionsStore.set(resProcInspections.data);
            });
}

export const fetchStatesAndMarkets = () => {
    Promise.all([
        fetchStates(),
        fetchMarkets()])    
        .then(([resStates, resMarkets]) => {
                if(resStates?.success) statesStore.set(resStates.data);
                if(resMarkets?.success) marketsStore.set(resMarkets.data);
            });
}

export const fetchVendors = async (view: string = '') => {
    let fetchParams: FetchParams|null  = getStore(fetchParamsStore);
    if (!fetchParams){
        toast.error('Please do relogin.! [Empty Fetch Params]');
        return;
    }
    fetchParams = {...fetchParams, regions: ['CASING PROCUREMENT'], view};
    return apiFetch(endpoints.production.vendors, {
        method: 'POST',
        body:{...fetchParams}
    });    
};

export const fetchItems = async (itemCategory: string | Array<string> = 'CASING', type: string = 'FromGroupDetail', respCenter: string = '') => {
    let fetchParams: FetchParams|null  = getStore(fetchParamsStore);
    if (!fetchParams){
        toast.error('Please do relogin.! [Empty Fetch Params]');
        return;
    }
    const body:FetchParams = { ...fetchParams, regions: typeof itemCategory === 'string' ? [itemCategory] : itemCategory, type, }; 
    if(respCenter !== '')
        body.respCenters = [respCenter];
    return apiFetch(endpoints.production.itemNos, {
        method: 'POST',
        body
    });
}

export const fetchMakes = async (itemCategory: string | Array<string> = 'TYREMAKE', itemGroup: string = 'casing') => {
    let fetchParams: FetchParams|null  = getStore(fetchParamsStore);
    if (!fetchParams){
        toast.error('Please do relogin.! [Empty Fetch Params]');
        return;
    }
    const body:FetchParams = { ...fetchParams, regions: typeof itemCategory === 'string' ? [itemCategory] : itemCategory, type: itemGroup };     
    return apiFetch(endpoints.production.makes, {
        method: 'POST',
        body
    });
}

export const fetchInspectors = async () => {
    let fetchParams: FetchParams|null  = getStore(fetchParamsStore);
    if (!fetchParams){
        toast.error('Please do relogin.! [Empty Fetch Params]');
        return;
    }
    const body:FetchParams = { ...fetchParams};     
    return apiFetch(endpoints.production.inspectorCodeNames, {
        method: 'POST',
        body
    });
}

export const fetchProcInspections = async () => {
    let fetchParams: FetchParams|null  = getStore(fetchParamsStore);
    if (!fetchParams){
        toast.error('Please do relogin.! [Empty Fetch Params]');
        return;
    }
    const body:FetchParams = { ...fetchParams};     
    return apiFetch(endpoints.production.procInspection, {
        method: 'POST',
        body
    });
}

export const fetchStates = () => {
    return apiFetch(endpoints.accounts.states, {
        method: 'POST'
    })
};

export const fetchMarkets = () => {
    let fetchParams: FetchParams|null  = getStore(fetchParamsStore);
    if (!fetchParams){
        toast.error('Please do relogin.! [Empty Fetch Params]');
        return;
    }
    const body:FetchParams = { ...fetchParams};     
    return apiFetch(endpoints.production.procMarkets, {
        method: 'POST',
        body
    });
};