export interface FixedAsset {
  no: string;
  description: string;
  description2: string;
  respCenter: string;
  employee: string;
  empName: string;
  purchaseDate: string;
  purchaseCost: number;
  expiryDate: string;
  mainAssetNo: string;
  class: string;
  subClass: string;
  serialNo: string;
  vendorNo: string;
  inactive: boolean;
  blocked: boolean;
  [key: string]: unknown;
}
