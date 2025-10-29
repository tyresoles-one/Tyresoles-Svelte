import { getStore, goto, pageStore } from "$lib";
import {toast} from '$lib/components';
import { orderStore, orderLinesStore, fetchParamsStore,  } from "$lib/managers/stores";
import { parseDateTime } from "@internationalized/date";

export const newOrderLine = () => {
    const order = getStore(orderStore);
    const orderLines = getStore(orderLinesStore);
    const fetchParams = getStore(fetchParamsStore);
    const page = getStore(pageStore);
    if (!order || !order.supplierCode) {
        toast.error('Please select a supplier first');
        return;
    }
    const blankLine = orderLines?.find((l) => l.itemNo === '' && l.lineNo > 0);
    if (blankLine) {
        console.log('blankLine', blankLine);
        goto(`/ecoproc/orders/${page.params.orderID}/${blankLine.lineNo}`);
    }
    let lines =
        orderLines && orderLines?.length > 0
            ? orderLines?.map((c) => c.lineNo)
            : [0];
    const maxLineNo = Math.max(...lines);
    const lineNo = maxLineNo + 10000;

    const prevOrderLine = orderLines?.find((c) => c.lineNo === maxLineNo);
    orderLinesStore.update((s) => [
        ...(s ?? []),
        {
            no: order.orderNo,
            date: new Date(),
            lineNo,
            sortNo: '',
            vendorNo: order.supplierCode,
            itemNo: prevOrderLine?.itemNo ?? '',
            serialNo: '',
            make: '',
            amount: 0,
            inspection: '',
            inspector: prevOrderLine?.inspector ??
                (fetchParams?.userDepartment === 'Production' ? fetchParams?.userName : ''),
            inspectorCode: prevOrderLine ?.inspectorCode ??
                (fetchParams?.userDepartment === 'Production' ? fetchParams?.userCode : '')
        }
    ]);
    goto(`/ecoproc/orders/${page.params.orderID}/${lineNo}`);
};