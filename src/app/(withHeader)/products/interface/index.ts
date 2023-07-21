import { Dispatch } from 'react';
import { Control, FieldErrors } from 'react-hook-form';

export type Product = {
  id: number | string;
  sku: string;
  unit_of_measure: string;
  available: string;
  upc: string;
  description: string;
  unit_cost: number;
  qty_on_hand: number;
  qty_reserve: number;
  qty_pending: number;
  image: string;
  created_at?: string;
  update_at?: string;
  organization: number | string;
};

export type ListProductType = {
  count: number;
  next: string;
  previous: string;
  results: Product[];
};

export type PackageRule = {
  id: number | string;
  name: string;
  created_at: string;
  updated_at: string;
  organization: number | string;
};

export type ProductStateType = {
  dataProduct: ListProductType;
  isLoading: boolean;
  error: string;
  packageRules: PackageRule[];
  productDetail: Product;
  dataBoxes: any[];
};

export type ContextType = {
  state: ProductStateType;
  dispatch: Dispatch<any>;
};

export type GetPayload = {
  search: string;
  currentPage: number;
};

export type Payload = {
  id?: number;
  name?: string;
};

export type CreateProductType = {
  id?: string;
  sku: string;
  unit_of_measure: string;
  available: string;
  upc: string;
  description: string;
  unit_cost: number;
  qty_on_hand: number;
  qty_reserve: number;
  qty_pending: number;
  image: string | undefined;
  cost?: string;
  warehouse?: string;
  product_series: number;
};

export type FormCreateProduct = {
  sku: string;
  unit_of_measure: string;
  available: string;
  upc: string;
  description: string;
  unit_cost: number;
  qty_on_hand: number;
  qty_reserve: number;
  qty_pending: number;
  image: string | undefined;
  product_series: {
    label: string;
    value: string | number;
  };
};

export type FormProductProps = {
  errors: FieldErrors<CreateProductType>;
  control: Control<CreateProductType, any>;
};

export type DataPackageRule = {
  box: {
    label: string;
    value: number | string;
  };
  id: number | string;
  max_quantity: string;
  product: {
    label: string;
    value: number | string;
  };
};

export type Boxes = {
  barcode_size: number;
  created_at: string;
  dimension_unit: string;
  height: number;
  id: number;
  length: number;
  max_quantity: number;
  name: string;
  updated_at: string;
  width: number;
};
