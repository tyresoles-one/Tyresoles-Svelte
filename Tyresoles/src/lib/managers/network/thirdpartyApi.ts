import { apiFetch } from "./client";
import { loadingStore } from "$lib/managers/stores";

export const fetchBankDetails = async (ifsc: string) =>{
    loadingStore.set(true);
    const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`).finally(() => loadingStore.set(false));   
    return response.json();
}