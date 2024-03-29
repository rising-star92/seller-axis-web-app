import { phoneRegExp } from '@/constants';
import { object, string, number } from 'yup';

export const schemaRetailerCarrier = object().shape({
  client_id: string().required('SKU is required'),
  client_secret: string().required('Merchant SKU is required'),
  account_number: string().required('Account number is required'),
  service: object()
    .shape({
      label: string().nonNullable(),
      value: number().nonNullable()
    })
    .required('Service rule is required'),

  retailer: object()
    .shape({
      label: string().nonNullable(),
      value: number().nonNullable()
    })
    .required('Retailer rule is required')
});

export const schemaRetailerCarrierEdit = object().shape({
  client_id: string().required('SKU is required'),
  client_secret: string().required('Merchant SKU is required'),
  account_number: string().required('Account number is required'),
  service: object()
    .shape({
      label: string().nonNullable(),
      value: number().nonNullable()
    })
    .required('Service rule is required'),

  retailer: object()
    .shape({
      label: string().nonNullable(),
      value: number().nonNullable()
    })
    .required('Retailer rule is required'),

  shipper: object().shape({
    name: string().required('Name is required'),
    attention_name: string().required('Attention name is required'),
    phone: string()
      .required('Phone is required')
      .matches(phoneRegExp, 'Phone number is invalid')
      .min(10, 'Too short'),
    shipper_number: string().required('Shipper number is required'),
    address: string().required('Address is required'),
    city: string().required('City is required'),
    state: string().required('State is required'),
    postal_code: string().required('Postal code is required'),
    country: string().required('Country is required'),
    company: string().required('Company is required')
  })
});

export const headerTable = [
  {
    id: 'client_id',
    label: 'Client id'
  },
  {
    id: 'client_secret',
    label: 'Client secret'
  },
  {
    id: 'service',
    label: 'Service'
  },
  {
    id: 'shipper',
    label: 'Shipper'
  },
  {
    id: 'created_at',
    label: 'Created at'
  },
  {
    id: 'action',
    label: 'Action'
  }
];
