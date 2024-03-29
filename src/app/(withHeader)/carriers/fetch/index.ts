import fetchClient from '@/utils/fetchClient';
import { CreateRetailerCarrier, ShipperRetailer } from '../interface';

// Rest API

export const getRetailerCarrierService = async ({
  search,
  page,
  rowsPerPage
}: {
  search: string;
  page: number;
  rowsPerPage: number;
}) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.get(
    `retailer-carriers?ordering=-created_at&search=${search}&offset=${
      page * rowsPerPage
    }&limit=${rowsPerPage}`
  );
};

export const getServicesService = async ({ search, page }: { search: string; page: number }) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.get(
    `services?ordering=-created_at&search=${search}&offset=${page * 10}&limit=10`
  );
};

export const createRetailerCarrierService = async (payload: CreateRetailerCarrier) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.post('retailer-carriers', payload);
};

export const updateRetailerCarrierService = async (payload: CreateRetailerCarrier) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.put(`retailer-carriers/${payload.id}`, payload);
};

export const createShipperRetailerCarrierService = async (payload: ShipperRetailer) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.post(`retailer-shippers`, payload);
};

export const updateShipperRetailerCarrierService = async (payload: ShipperRetailer) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.put(`retailer-shippers/${payload.id}`, payload);
};

export const deleteRetailerCarrierService = async (id: number) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.delete(`retailer-carriers/${id}`);
};

export const getRetailerService = async ({ search, page }: { search: string; page: number }) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.get(
    `retailers?ordering=-created_at&search=${search}&offset=${page * 10}&limit=10`
  );
};

export const getRetailerCarrierDetailService = async (id: number) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.get(`retailer-carriers/${id}`);
};

export const deleteBulkCarrierService = async (ids: number[]) => {
  const httpFetchClient = fetchClient();

  return await httpFetchClient.delete(`retailer-carriers/bulk?ids=${ids}`);
};
