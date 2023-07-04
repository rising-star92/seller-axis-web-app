import Cookies from 'js-cookie';

import fetchClient from '@/utils/fetchClient';
import { OrganizationDetailType, PayloadType, createOrganizationType } from '../interfaces';

export const createOrganizationService = async (payload: createOrganizationType) => {
  const httpFetchClient = new fetchClient();

  return await httpFetchClient.post('organizations', payload);
};

export const getOrganizationMemberService = async (payload: PayloadType) => {
  const httpFetchClient = new fetchClient();
  return await httpFetchClient.get(
    `organizations-member?search=${payload.search}&offset=${payload.page}`
  );
};

export const inviteMemberService = async (payload: any) => {
  const httpFetchClient = new fetchClient();

  return await httpFetchClient.post(`organizations-member`, payload);
};

export const getOrganizationsService = async () => {
  const httpFetchClient = new fetchClient();

  return await httpFetchClient.get('organizations');
};

export const getOrganizationDetailService = async () => {
  const current_organizations = Cookies.get('current_organizations');
  const httpFetchClient = new fetchClient();
  if (current_organizations) {
    return await httpFetchClient.get(`organizations/${current_organizations}`);
  }
};

export const updateOrganizationsService = async (payload: OrganizationDetailType) => {
  const httpFetchClient = new fetchClient();

  return await httpFetchClient.put(`organizations/${payload.id}`, payload);
};

export const getRolesService = async () => {
  const httpFetchClient = new fetchClient();
  return await httpFetchClient.get(`roles`);
};
