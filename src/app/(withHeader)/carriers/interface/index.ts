import { Dispatch } from 'react';

export type RetailerCarrier = {
  client_id: string;
  client_secret: string;
  created_at: string;
  id: number | string;
  updated_at: string;
  account_number: string;
  retailer: {
    created_at: string;
    id: number | string;
    name: string;
    organization: number | string;
    type: string;
    updated_at: string;
    merchant_id: string;
  };
  service: {
    created_at: string;
    general_client_id: string;
    general_client_secret: string;
    id: number | string;
    name: string;
    type: string;
    updated_at: string;
  };
  default_service_type?: {
    code: string;
    created_at: string;
    id: number;
    name: string;
    service: number;
    updated_at: string;
  };
  shipper: ShipperRetailer;
};

export type ListRetailerCarrier = {
  count: number;
  next: string;
  previous: string;
  results: RetailerCarrier[];
};

export type RetailerType = {
  created_at: string;
  id: number;
  name: string;
  organization: number;
  type: string;
  updated_at: string;
};

export type RetailerCarrierStateType = {
  dataRetailerCarrier: ListRetailerCarrier;
  isLoading: boolean;
  isLoadingUpdate: boolean;
  isLoadingBulkDelete: boolean;
  error: string;
  dataServices: any[];
  dataRetailerCarrierDetail: RetailerCarrier;
};

export type ContextType = {
  state: RetailerCarrierStateType;
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

export type CreateRetailerCarrier = {
  id?: string | number;
  client_id: string;
  client_secret: string;
  service: string | number;
  default_service_type: number;
  shipper?: ShipperRetailer;
};

export type ShipperRetailer = {
  id?: string | number;
  name?: string;
  attention_name?: string;
  tax_identification_number?: string;
  phone?: string;
  email?: string;
  shipper_number?: string;
  fax_number?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  company?: string;
  retailer_carrier?: number;
};

export type RetailerCarrierValueType = {
  client_id: string;
  client_secret: string;
  service: PayloadType;
  default_service_type: {
    value: number;
    label: string;
  };

  shipper?: ShipperRetailer;
};
