import { Product } from '../../products/interface';
import { RetailerWarehouse } from '../../warehouse/interface';

export type ProductAlias = {
  created_at: string;
  is_live_data?: boolean;
  id: number | string;
  merchant_sku: string;
  last_queue_history?: string;
  product?: Product;
  retailer?: {
    created_at: string;
    id: number | string;
    name: string;
    organization: number | string;
    type: string;
    updated_at: string;
    retailer_queue_history?: RetailerQueueHistory[];
  };
  retailer_warehouse_products?: any;
  retailer_warehouse?: {
    address: string;
    created_at: string;
    description: string;
    id: number;
    name: string;
    retailer: number;
    updated_at: string;
  };
  sku: string;
  product_name?: string;
  vendor_sku: string;
  updated_at: string;
  warehouse?: RetailerWarehouse[];
  availability?: string;
};

export type RetailerQueueHistory = {
  status: string;
  result_url: string;
};

export type RetailerWarehouseProducts = {
  created_at: string;
  id: number;
  product_alias: number;
  product_warehouse_statices: {};
};

export type Retailer = {
  created_at: string;
  id: number;
  label: string;
  result_url: string;
  retailer: number;
  status: string;
  type: string;
  updated_at: string;
};

export type ResDownloadInventory = {
  created_at: string;
  id: number;
  label: string;
  result_url: string;
  retailer: number;
  status: string;
  type: string;
  updated_at: string;
};
