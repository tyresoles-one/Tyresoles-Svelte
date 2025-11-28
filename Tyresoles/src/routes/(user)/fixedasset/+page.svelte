<script lang="ts">
  import {
    DialogPage,
    Grid,
    Form,
    type InputProps,
    toast,
    Button,
  } from "$lib/components";
  import type {
    FixedAsset,
    FetchParams,
    CodeValue,
  } from "$lib/business/models";
  import { RespCenters } from "$lib/business";
  import {
    apiFetch,
    endpoints,
    getURLSearchParams,
  } from "$lib/managers/network";
  import {
    fetchParamsStore,
    loadingStore,
    userStore,
  } from "$lib/managers/stores";
  import { onMount } from "svelte";
  import Dialog from "$lib/components/custom/dialog/dialog.svelte";

  let fetchParams = $state<FetchParams>({
    ...$fetchParamsStore,
    respCenters: $userStore?.locations.map((d) => d.respCode),
  } as FetchParams);

  let data = $state<FixedAsset[]>([]);
  let record = $state<FixedAsset>({} as FixedAsset);
  let open = $state<boolean>(false);
  let openHelp = $state<boolean>(false);

  onMount(() => {
    getRecords();
    getMainFixedAssets("IT ASSET");
    apiFetch(endpoints.accounts.faClasses, {
      method: "GET",
    }).then((resp) => {
      if (resp.success) {
        const fldClass = fields.find((c) => c.name === "class");
        if (fldClass) {
          fldClass.data = resp.data;
        }
      }
    });
  });

  const getRecords = () => {
    apiFetch(endpoints.accounts.fixedAssets, {
      method: "POST",
      body: fetchParams,
    }).then((resp) => {
      if (resp.success) {
        data = resp.data;
      }
    });
  };

  const handleSave = () => {
    if (!record || !record.serialNo) {
      toast.error("Invalid record.!");
      return;
    }
    if (record.expiryDate)
      record.expiryDate = new Date(record.expiryDate).toISOString();
    if (record.purchaseDate)
      record.purchaseDate = new Date(record.purchaseDate).toISOString();
    apiFetch(endpoints.accounts.upsertFixedAsset, {
      method: "POST",
      body: record,
    }).then((resp) => {
      if (resp.success) {
        open = false;
        getRecords();
      }
    });
  };

  const getMainFixedAssets = (faClass: string) => {
    apiFetch(endpoints.accounts.fixedAssets, {
      method: "POST",
      body: { ...fetchParams, regions: [faClass], type: "Main" } as FetchParams,
    }).then((resp) => {
      if (resp.success) {
        const fldMainFA = fields.find((c) => c.name === "mainAssetNo");
        if (fldMainFA) {
          fldMainFA.data = resp.data;
        }
      }
    });
  };

  const fields = $state<InputProps[]>([
    {
      name: "class",
      label: "Asset Class",
      type: "list",
      columns: [{ name: "value", label: "Class" }],
      hideHeader: true,
      dataKey: "code",
      onselectionchange: (e: Event) => {
        if (e.target?.value) {
          const parm = {
            faClass: e.target.value,
          };
          apiFetch(
            `${endpoints.accounts.faSubClasses}?${getURLSearchParams(parm)}`,
            {
              method: "POST",
            }
          ).then((resp) => {
            if (resp.success) {
              const fldSubClass = fields.find((c) => c.name === "subClass");
              if (fldSubClass) {
                fldSubClass.data = resp.data;
              }
            }
          });
          getMainFixedAssets(e.target?.value ?? "IT ASSET");
          // apiFetch(endpoints.accounts.fixedAssets, {
          //   method: "POST",
          //   body: { ...fetchParams, regions: [e.target.value] } as FetchParams,
          // }).then((resp) => {
          //   if (resp.success) {
          //     const fldMainFA = fields.find((c) => c.name === "mainAssetNo");
          //     if (fldMainFA) {
          //       fldMainFA.data = resp.data;
          //     }
          //   }
          // });
        }
      },
    },
    {
      name: "subClass",
      label: "Sub Class",
      type: "list",
      dataKey: "code",
      labelKey: "value",
      valueKey: "code",
      hideHeader: true,
      columns: [{ name: "value", label: "value" }],
    },
    { name: "serialNo", label: "Serial No" },
    { name: "description", label: "Description" },
    { name: "description2", label: "Description 2" },
    {
      name: "respCenter",
      label: "Location",
      type: "list",
      columns: [{ name: "name", label: "Response Center" }],
      hideHeader: true,
      dataKey: "code",
      labelKey: "name",
      valueKey: "code",
      selectionType: "single",
      output: "string",
      data: $userStore?.locations.map((d) => ({
        name: RespCenters.find((r) => r.code === d.respCode)?.name,
        code: d.respCode,
      })),
      onselectionchange: (e: Event) => {
        const fldEmp = fields.find((c) => c.name === "employee");
        if (fldEmp) {
          fldEmp.data = [];
          fldEmp.value = "";
        }
        if (e.target?.value) {
          const filterParam = {
            ...$fetchParamsStore,
            RespCenters: [e.target?.value],
            View: "InclConsulting",
          };
          apiFetch(endpoints.payroll.employeeCodeNames, {
            method: "POST",
            body: filterParam,
          }).then((resp) => {
            if (resp.success) {
              console.log(resp.data);
              if (fldEmp) {
                fldEmp.data = resp.data;
              }
            }
          });
        }
      },
    },
    {
      name: "employee",
      label: "Employee",
      type: "list",
      selectionType: "single",
      dataKey: "code",
      valueKey: "code",
      labelKey: "name",
    },
    {
      name: "purchaseDate",
      label: "Date of Purchase",
      type: "date",
    },
    {
      name: "expiryDate",
      label: "Date of Expiry",
      type: "date",
    },
    {
      name: "purchaseCost",
      label: "Purchase Cost",
      type: "number",
    },
    {
      name: "vendorNo",
      label: "Supplier Code",
    },
    {
      name: "mainAssetNo",
      label: "Main FA No",
      type: "list",
      dataKey: "no",
      valueKey: "no",
      labelKey: "no",
      columns: [
        { name: "no", label: "FA No" },
        { name: "subClass", label: "Sub Class" },
        { name: "empName", label: "Employee" },
      ],
    },
    {
      name: "inactive",
      type: "boolean",
      label: "In Active",
    },
    {
      name: "blocked",
      type: "boolean",
      label: "Blocked",
    },
  ]);

  const fetchList = () => {
    apiFetch(endpoints.accounts.fixedAssets, {
      method: "POST",
      body: fetchParams,
    }).then((resp) => {
      if (resp.success) {
        data = resp.data;
      }
    });
  };

  onMount(() => {
    fetchList();
  });
  const openHelpWindow = () => {
    openHelp = true;
  };
  $inspect(data, "data");
</script>

<Grid
  loading={$loadingStore}
  {data}
  onRowClick={(rec) => {
    record = rec as FixedAsset;
    open = true;
  }}
  columns={[
    { name: "no", label: "No", textAlign: "left" },
    { name: "description", label: "Description", textAlign: "left" },
    { name: "respCenter", label: "Location", textAlign: "left" },
    { name: "employee", label: "Employee", textAlign: "left" },
    { name: "empName", label: "Emp Name", textAlign: "left" },
    { name: "subClass", label: "Sub Class", textAlign: "left" },
    {
      name: "purchaseDate",
      label: "Purchase Date",
      formatter: (d) => new Date(d).toLocaleDateString(),
    },
    {
      name: "expiryDate",
      label: "Exp. Date",
      formatter: (d) => new Date(d).toLocaleDateString(),
    },
    { name: "purchaseCost", label: "Purchase Cost", textAlign: "right" },
  ]}
  actions={[
    {
      label: "New",
      icon: "Plus",
      onclick: () => {
        record = {
          blocked: false,
          class: "",
          description: "",
          description2: "",
          employee: "",
          expiryDate: Date(),
          inactive: false,
          mainAssetNo: "",
          no: "",
          purchaseDate: Date(),
          respCenter: "",
          serialNo: "",
          subClass: "",
          vendorNo: "",
          empName: "",
          purchaseCost: 0,
        };
        open = true;
      },
    },
    {
      label: "Refresh",
      variant: "outline",
      icon: "RefreshCw",
      onclick: getRecords,
    },
    {
      label: "Help",
      icon: "FileQuestionMark",
      onclick: openHelpWindow,
      variant: "outline",
    },
  ]}
/>

<DialogPage title="Help" open={openHelp} onOpenChange={(o) => (openHelp = o)}>
  <div class="p-6">
    <div class="mb-4 bg-slate-200 text-center rounded p-1">
      For getting windows details
    </div>
    <ul style="list-style-type:disc ">
      <li>Press <strong>Win + R</strong></li>
      <li>
        Type this <strong>msinfo32</strong>
        <Button
          icon="Clipboard"
          size="icon"
          variant="ghost"
          onclick={() => {
            const clipboardData = "msinfo32";
            navigator.clipboard.writeText(clipboardData);
            toast.success("Copied to clipboard");
          }}
        />
      </li>
    </ul>
    <div class="mb-4 bg-slate-200 text-center rounded p-1 mt-4">
      For getting windows serial number
    </div>
    <ul style="list-style-type:disc">
      <li>Open <strong>Windows Powershell</strong></li>
      <li>
        Run this command <strong
          >(Get-CimInstance -ClassName Win32_BIOS).SerialNumber</strong
        >
        <Button
          icon="Clipboard"
          size="icon"
          variant="ghost"
          onclick={() => {
            const clipboardData =
              "(Get-CimInstance -ClassName Win32_BIOS).SerialNumber";
            navigator.clipboard.writeText(clipboardData);
            toast.success("Copied to clipboard");
          }}
        />
      </li>
    </ul>
  </div>
</DialogPage>

<DialogPage
  title={`Fixed Asset`}
  loading={$loadingStore}
  {open}
  onOpenChange={(o) => (open = o)}
  autoFocus={false}
  actionLabel="Save"
  onAction={handleSave}
  actions={[]}
>
  <Form
    bind:data={record}
    {fields}
    class="h-[85vh]"
    layoutClass="grid grid-cols-2 gap-3 p-4 w-full"
  />
</DialogPage>
