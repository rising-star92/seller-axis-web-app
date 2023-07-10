import { Dispatch } from 'react';

export type ProductAlias = {
  created_at: string;
  id: number;
  merchant_sku: string;
  product: number;
  retailer: number;
  sku: string;
  vendor_sku: string;
  updated_at: string;
};

export type ListProductAlias = {
  count: number;
  next: string;
  previous: string;
  results: ProductAlias[];
};

export type PackageRuleType = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  organization: number;
};

export type RetailerType = {
  created_at: string;
  id: number;
  name: string;
  organization: number;
  type: string;
  updated_at: string;
};

export type ProductAliasStateType = {
  dataProductAlias: ListProductAlias;
  isLoading: boolean;
  error: string;
  dataRetailer: RetailerType[];
};

export type ContextType = {
  state: ProductAliasStateType;
  dispatch: Dispatch<any>;
};

export type GetPayloadType = {
  search: string;
  currentPage: number;
};

export type PayloadType = {
  value: number;
  label: string;
};

export type CreateProductAlias = {
  services: number;
  retailer: number;
  product: number;
  sku: string;
  merchant_sku: string;
  vendor_sku: string;
};

export type ProductAliasValueType = {
  services: PayloadType;
  retailer: PayloadType;
  product: PayloadType;
  sku: string;
  merchant_sku: string;
  vendor_sku: string;
};
