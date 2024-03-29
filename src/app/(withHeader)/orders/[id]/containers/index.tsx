/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import * as actionsWarehouse from '@/app/(withHeader)/warehouse/context/action';
import { useStore as useStoreWarehouse } from '@/app/(withHeader)/warehouse/context/index';
import { useStore as useStoreOrg } from '@/app/(withHeader)/organizations/context';
import * as actionsRetailerCarrier from '@/app/(withHeader)/carriers/context/action';
import { useStore as useStoreRetailerCarrier } from '@/app/(withHeader)/carriers/context/index';
import * as servicesRetailerCarrier from '@/app/(withHeader)/carriers/fetch';
import * as servicesWarehouse from '@/app/(withHeader)/warehouse/fetch';
import { openAlertMessage } from '@/components/ui/Alert/context/action';
import { useStore as useStoreAlert } from '@/components/ui/Alert/context/hooks';
import { Button } from '@/components/ui/Button';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import dynamic from 'next/dynamic';
import { useStore } from '../../context';
import * as actions from '../../context/action';
import { setOrderDetail } from '../../context/action';
import {
  byPassService,
  cancelOrderService,
  createAcknowledgeService,
  createShipmentService,
  getInvoiceService,
  getNewOrderDetailService,
  getOrderDetailServer,
  getShippingService,
  importBackOrderService,
  invoiceConfirmationService,
  resetReferenceService,
  revertAddressService,
  shipConfirmationService,
  updateBackOrderService,
  updateShipToService,
  updateWarehouseOrderService,
  verifyAddressService
} from '../../fetch';
import CancelOrder from '../components/CancelOrder';
import ConfigureShipment from '../components/ConfigureShipment';
import Cost from '../components/Cost';
import General from '../components/General';
import ManualShip from '../components/ManualShip';
import OrderItem from '../components/OrderItem';
import Package from '../components/Package';
import Recipient from '../components/Recipient';
import SubmitInvoice from '../components/SubmitInvoice';
import Loading from '../loading';
import ButtonDropdown from '@/components/ui/ButtonDropdown';
import { Modal } from '@/components/ui/Modal';
import useToggleModal from '@/hooks/useToggleModal';
import BackOrder from '../components/BackOrder';
import { convertDateToISO8601, generateNewBase64s } from '@/utils/utils';
import { CREATED, ORDER_STATUS, SUBMITTED } from '@/constants';
import Warehouse from '../components/Warehouse';
import { schemaWarehouse } from '../../constants';
import type { RetailerWarehouse } from '@/app/(withHeader)/warehouse/interface';
import NoteOrder from '../components/NoteOrder';

import type {
  Label,
  Order,
  OrderPackage,
  PayloadManualShip,
  Shipment,
  ShipmentPackages,
  ShippingService,
  TypeOrderReturn,
  UpdateShipTo
} from '../../interface';
import { imageUrlToBase64 } from '../components/ShipConfirmation/component/ModalPrintLabel';
import ReturnOrder from '../components/ReturnOrder';
import OrderReturn from '../components/OrderReturn';

dayjs.extend(utc);
dayjs.extend(timezone);

const ShipConfirmation = dynamic(() => import('../components/ShipConfirmation'), {
  ssr: false
});

const ModalPrintAfterShip = dynamic(() => import('../components/ModalPrintAfterShip'), {
  ssr: false
});

const OrderDetailContainer = () => {
  const params = useParams();
  const {
    state: { organizations }
  } = useStoreOrg();
  const currentOrganization = Cookies.get('current_organizations');
  const currentLocalTime = dayjs().utc();
  const { debouncedSearchTerm, handleSearch } = useSearch('order');

  const { debouncedSearchTerm: debouncedSearchTermService, handleSearch: handleSearchService } =
    useSearch('service');

  const { openModal, handleToggleModal } = useToggleModal();

  const { page, rowsPerPage, onPageChange } = usePagination();
  const {
    state: {
      orderDetail,
      isLoadingAcknowledge,
      isLoadingVerify,
      isLoadingShipment,
      isLoadingUpdateShipTo,
      isLoadingShipConfirmation,
      dataShippingService,
      isLoadingCreateManualShip,
      isLoadingCreateInvoice,
      isLoadingRevert,
      isLoadingByPass,
      isLoading,
      isLoadingBackOrder,
      isLoadingUpdateWarehouseOrder,
      isLoadingResetRef
    },
    dispatch
  } = useStore();

  const {
    state: { dataRetailerCarrier },
    dispatch: RetailerCarrier
  } = useStoreRetailerCarrier();
  const { debouncedSearchTerm: debouncedSearchTermWarehouse } = useSearch('warehouse');

  const {
    state: { dataRetailerWarehouse },
    dispatch: dispatchWarehouse
  } = useStoreWarehouse();

  const { dispatch: dispatchAlert } = useStoreAlert();

  const isStatusInvoice = useMemo(() => {
    return orderDetail?.status_history?.includes(ORDER_STATUS.Invoiced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderDetail?.status_history)]);

  const {
    control: controlWarehouse,
    formState: { errors: errorsWarehouse },
    handleSubmit: handleSubmitWarehouse,
    watch: watchWarehouse,
    setValue: setValueWarehouse
  } = useForm({
    defaultValues: {
      retailer_warehouse: null
    },
    mode: 'onChange',
    resolver: yupResolver<any>(schemaWarehouse)
  });
  const retailerWarehouse = watchWarehouse('retailer_warehouse');

  const handleSaveWarehouse = async () => {
    try {
      dispatch(actions.updateWarehouseOrderRequest());
      await updateWarehouseOrderService(
        {
          warehouse: +retailerWarehouse?.value
        },
        +orderDetail?.id
      );
      dispatch(actions.updateWarehouseOrderSuccess());
      const dataOrder = await getOrderDetailServer(+params?.id);
      dispatch(actions.setOrderDetail(dataOrder));
      dispatchAlert(
        openAlertMessage({
          message: 'Update Warehouse Successfully',
          color: 'success',
          title: 'Success'
        })
      );
    } catch (error: any) {
      dispatch(actions.updateWarehouseOrderFailure());
      dispatchAlert(
        openAlertMessage({
          message: error?.message || 'Update Warehouse Error',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const [retailerCarrier, setRetailerCarrier] = useState<{
    label: string;
    service: number | string;
    value: number | string;
  }>({ label: '', service: '', value: '' });
  const [isResidential, setIsResidential] = useState<boolean>(false);
  const [itemShippingService, setItemShippingService] = useState<ShippingService>();
  const [isCheckDimensions, setIsCheckDimensions] = useState<boolean>(false);
  const [isMatchWarehouse, setIsMatchWarehouse] = useState<boolean>(false);
  const [allLabelAfterShip, setAllLabelAfterShip] = useState<Label[]>([]);
  const [dataPrintAfterShip, setDataPrintAfterShip] = useState({
    listItemShipped: [] as OrderPackage[],
    orderDetail: null,
    itemsLabel: [] as ShipmentPackages[]
  });
  const [isOpenModalAfterPrint, setIsOpenModalAfterPrint] = useState<boolean>(false);

  const [isPrintAll, setIsPrintAll] = useState({
    packingSlip: false,
    barcode: false,
    label: false,
    gs1: false,
    all: false
  });
  const [isReturnOrder, setIsReturnOrder] = useState<{
    isOpen: boolean;
    orderReturn: TypeOrderReturn | null;
  }>({
    isOpen: false,
    orderReturn: null
  });

  // const isCheckShipFullPack = useMemo(() => {
  //   return orderDetail?.items?.every((item) => item?.qty_ordered === item?.ship_qty_ordered);
  // }, [JSON.stringify(orderDetail?.items)]);

  const orderPackageNotShip = useMemo(
    () =>
      orderDetail?.order_packages?.filter((item) => {
        if (item?.shipment_packages?.length > 0) {
          return !item.shipment_packages.some((packageItem) =>
            [SUBMITTED, CREATED].includes(packageItem?.status?.toLowerCase())
          );
        }
        return true;
      }),
    [JSON.stringify(orderDetail?.order_packages)]
  );

  const isStatusBtnInvoiceConfirmation = useMemo(() => {
    return !orderDetail?.status_history?.includes(
      ORDER_STATUS.Invoiced && ORDER_STATUS['Shipment Confirmed']
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderDetail?.status_history)]);

  const isStatusBtnShipmentConfirmation = useMemo(() => {
    return (
      ![
        ORDER_STATUS['Partly Shipped'],
        ORDER_STATUS['Partly Shipped Confirmed'],
        ORDER_STATUS.Shipped,
        ORDER_STATUS.Invoiced
      ]?.includes(orderDetail?.status) ||
      orderDetail?.status_history?.includes(ORDER_STATUS['Shipment Confirmed'])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderDetail?.status)]);

  const isStatusBtnBackOrder = useMemo(() => {
    return ![
      ORDER_STATUS.Opened,
      ORDER_STATUS.Acknowledged,
      ORDER_STATUS['Bypassed Acknowledge'],
      ORDER_STATUS.Backorder
    ]?.includes(orderDetail?.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderDetail?.status)]);

  const isStatusBtnAcknowledge = useMemo(() => {
    return (
      ![ORDER_STATUS.Opened]?.includes(orderDetail?.status) ||
      orderDetail?.status_history?.includes(ORDER_STATUS.Acknowledged)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderDetail?.status), JSON.stringify(orderDetail?.status_history)]);

  const isStatusBtnReturnOrder = useMemo(() => {
    return ![
      ORDER_STATUS['Shipment Confirmed'],
      ORDER_STATUS.Invoiced,
      ORDER_STATUS['Invoice Confirmed'],
      ORDER_STATUS['Partly Shipped Confirmed']
    ]?.includes(orderDetail?.status);
  }, [JSON.stringify(orderDetail?.status)]);

  const isShowCardShipConfirmed = useMemo(() => {
    return (
      [
        ORDER_STATUS.Shipped,
        ORDER_STATUS.Acknowledged,
        ORDER_STATUS['Shipment Confirmed'],
        ORDER_STATUS.Invoiced,
        ORDER_STATUS['Invoice Confirmed'],
        ORDER_STATUS['Partly Shipped'],
        ORDER_STATUS['Partly Shipped Confirmed']
      ]?.includes(orderDetail?.status) ||
      orderDetail?.order_packages?.some((item) => item?.shipment_packages?.length > 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderDetail)]);

  const tokenExpTime = useMemo(() => {
    if (currentOrganization && organizations[currentOrganization]?.is_sandbox) {
      return organizations[currentOrganization]?.sandbox_organization?.qbo_refresh_token_exp_time;
    } else if (currentOrganization && !organizations[currentOrganization]?.is_sandbox) {
      return organizations[currentOrganization]?.qbo_refresh_token_exp_time;
    } else return null;
  }, [currentOrganization, organizations]);

  const itemWarehousesNotSelect = useMemo(() => {
    if (!orderDetail?.items || !retailerWarehouse) {
      return [];
    }
    return orderDetail?.items?.filter(
      (item) =>
        !item?.product_alias?.warehouse?.some(
          (warehouse: RetailerWarehouse) => warehouse?.id === +retailerWarehouse?.value
        )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderDetail?.items), retailerWarehouse]);

  const handleCloseModalPrintAfterShip = () => {
    setIsOpenModalAfterPrint(false);
  };

  const handleChangeIsPrintAll = (name: 'packingSlip' | 'barcode' | 'label' | 'gs1' | 'all') => {
    setIsPrintAll({
      ...isPrintAll,
      [name]: !isPrintAll[name]
    });
  };

  const handleChangeRetailerCarrier = (data: {
    label: string;
    service: number | string;
    value: number | string;
  }) => {
    setRetailerCarrier(data);
    setIsResidential(false);
    if (
      orderDetail?.verified_ship_to?.status === 'VERIFIED' &&
      orderDetail?.verified_ship_to?.classification === 'RESIDENTIAL'
    ) {
      handleRevertAddress();
    }
  };

  const handleChangeShippingService = (data: { label: string; value: string }) => {
    if (
      orderDetail?.verified_ship_to?.status === 'VERIFIED' &&
      data?.value !== 'GROUND_HOME_DELIVERY' &&
      orderDetail?.verified_ship_to?.classification === 'RESIDENTIAL'
    ) {
      handleRevertAddress();
      setIsResidential(false);
    } else if (data?.value === 'GROUND_HOME_DELIVERY') {
      setIsResidential(true);
    } else {
      setIsResidential(false);
    }
  };

  const handleRevertAddress = async () => {
    try {
      dispatch(actions.revertAddressRequest());
      const res = await revertAddressService(+orderDetail?.id, {
        carrier_id: orderDetail?.batch.retailer.default_carrier?.id as never,
        ...orderDetail?.verified_ship_to,
        status: 'UNVERIFIED'
      });
      dispatch(actions.revertAddressSuccess(res));
    } catch (error: any) {
      dispatch(actions.revertAddressFailure(error.message));
    }
  };

  const handleCreateManualShip = async (data: PayloadManualShip) => {
    try {
      dispatch(actions.createManualShipRequest());
      dispatch(actions.createManualShipSuccess(data));
    } catch (error: any) {
      dispatch(actions.createManualShipFailure(error.message));
    }
  };

  const handleGetInvoice = useCallback(
    async (on_invoice?: string) => {
      try {
        dispatch(actions.createInvoiceQuickBookShipRequest());
        const res = await getInvoiceService();
        dispatch(actions.createInvoiceQuickBookShipSuccess());
        localStorage.setItem('order_id', params?.id as string);
        on_invoice && localStorage.setItem('on_invoice', on_invoice as string);
        window.open(res?.auth_url, '_self');
      } catch (error: any) {
        dispatch(actions.createInvoiceQuickBookShipFailure(error.message));
        dispatchAlert(
          openAlertMessage({
            message: error?.message,
            color: 'error',
            title: 'Fail'
          })
        );
      }
    },
    [dispatch, params?.id, dispatchAlert]
  );

  const handleSubmitAcknowledge = async () => {
    try {
      dispatch(actions.createAcknowledgeRequest());
      const res = await createAcknowledgeService(+orderDetail?.id);
      dispatch(actions.createAcknowledgeSuccess());
      dispatchAlert(
        openAlertMessage({
          message:
            res.status === 'COMPLETED'
              ? 'Acknowledge Successfully'
              : res?.data?.error?.default_code,
          color: res.status === 'COMPLETED' ? 'success' : 'error',
          title:
            res.status === 'COMPLETED' ? (
              'Success'
            ) : (
              <div className="flex">
                <p className="flex">
                  Please click
                  <span
                    className="cursor-pointer px-1 text-dodgeBlue underline"
                    onClick={() => window.open(`/sftp/${res.sftp_id}`, '_blank')}
                  >
                    SFTP
                  </span>
                  to change or
                </p>
                <button
                  disabled={isLoadingByPass}
                  className="ml-[1px] whitespace-normal break-words text-dodgeBlue underline"
                  onClick={() => handleByPass()}
                >
                  Bypass
                </button>
              </div>
            ),
          customTimeHide: res.status === 'COMPLETED' ? 2000 : 6000
        })
      );
      const dataOrder = await getOrderDetailServer(+params?.id);
      dispatch(actions.setOrderDetail(dataOrder));
    } catch (error: any) {
      dispatch(actions.createAcknowledgeFailure(error.message));
      dispatchAlert(
        openAlertMessage({
          message: 'Error',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const handleByPass = async () => {
    try {
      dispatch(actions.byPassRequest());
      await byPassService(+params?.id);
      dispatch(actions.byPassFromSuccess());
      const dataOrder = await getOrderDetailServer(+params?.id);
      dispatch(actions.setOrderDetail(dataOrder));
      dispatchAlert(
        openAlertMessage({
          message: 'ByPass Acknowledge Successfully',
          color: 'success',
          title: 'Success'
        })
      );
    } catch (error: any) {
      dispatch(actions.byPassFailure(error.message));
      dispatchAlert(
        openAlertMessage({
          message: error.message || 'ByPass Acknowledge Fail',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const handleGetShippingService = useCallback(async () => {
    try {
      dispatch(actions.getShippingServiceRequest());
      const response = await getShippingService({
        search: debouncedSearchTermService,
        page,
        rowsPerPage: 100,
        service:
          +retailerCarrier.service ||
          (+orderDetail?.batch.retailer.default_carrier?.service?.id as never)
      });
      dispatch(actions.getShippingServiceSuccess(response.results));
    } catch (error: any) {
      dispatch(actions.getShippingServiceFailure(error.message));
    }
  }, [
    dispatch,
    debouncedSearchTermService,
    page,
    retailerCarrier.service,
    orderDetail?.batch.retailer.default_carrier?.service?.id
  ]);

  const handleGetRetailerCarrier = useCallback(async () => {
    try {
      RetailerCarrier(actionsRetailerCarrier.getRetailerCarrierRequest());
      const dataProduct = await servicesRetailerCarrier.getRetailerCarrierService({
        search: debouncedSearchTerm,
        page,
        rowsPerPage: 100
      });
      RetailerCarrier(actionsRetailerCarrier.getRetailerCarrierSuccess(dataProduct));
    } catch (error) {
      RetailerCarrier(actionsRetailerCarrier.getRetailerCarrierFailure(error));
    }
  }, [RetailerCarrier, debouncedSearchTerm, page]);

  const handleVerifyAddress = async () => {
    try {
      if (orderDetail.id) {
        dispatch(actions.verifyAddressRequest());

        const res = await verifyAddressService(+orderDetail?.id, {
          ...orderDetail?.verified_ship_to,
          carrier_id: orderDetail?.batch?.retailer?.default_carrier?.id
            ? +orderDetail?.batch.retailer.default_carrier?.id
            : +retailerCarrier.value,
          status: 'VERIFIED'
        });
        dispatch(actions.verifyAddressSuccess(res));
        dispatchAlert(
          openAlertMessage({
            message: 'Verify successfully',
            color: 'success',
            title: 'Success'
          })
        );
      }
    } catch (error: any) {
      dispatch(actions.verifyAddressFailure(error.message));
      dispatchAlert(
        openAlertMessage({
          message: error?.message || 'verify Error',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const handleCreateShipment = async (data: Shipment) => {
    try {
      dispatch(actions.createShipmentRequest());
      const res = await createShipmentService({
        ...data,
        id: +orderDetail?.id,
        carrier: +data.carrier.value,
        shipping_service: data.shipping_service.value,
        gs1: data?.gs1?.value
      });
      const dataOrder = await getOrderDetailServer(+params?.id);
      dispatch(actions.setOrderDetail(dataOrder));
      const listIdPackage = res?.list_package?.map((item: { package: number }) => item?.package);
      const itemsShipped = dataOrder?.order_packages?.filter((itemOrder: { id: number }) =>
        listIdPackage?.includes(+itemOrder?.id)
      );

      const listId = res?.list_package?.map((item: { id: number }) => item?.id);
      const itemsLabel = dataOrder?.order_packages
        ?.flatMap((item: OrderPackage) => item?.shipment_packages)
        ?.filter((itemShipmentPackages: { id: number }) =>
          listId?.includes(+itemShipmentPackages?.id)
        );

      const updatedOrderDetailAfterShip = {
        ...dataOrder,
        items: res?.list_item
      };
      dispatch(actions.createShipmentSuccess());
      setDataPrintAfterShip({
        listItemShipped: itemsShipped,
        orderDetail: updatedOrderDetailAfterShip,
        itemsLabel: itemsLabel
      });
      setIsOpenModalAfterPrint(true);
      dispatchAlert(
        openAlertMessage({
          message: 'Successfully',
          color: 'success',
          title: 'Success'
        })
      );
    } catch (error: any) {
      dispatch(actions.createShipmentFailure(error.message));
      dispatchAlert(
        openAlertMessage({
          message: error.message || 'Error',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const handleUpdateShipTo = async (data: UpdateShipTo, callback: () => void) => {
    try {
      dispatch(actions.updateShipToRequest());
      const res = await updateShipToService(+params?.id, {
        ...data,
        phone: data.day_phone,
        carrier_id:
          (orderDetail?.batch.retailer.default_carrier?.id as never) || retailerCarrier.value,
        status: 'EDITED'
      });
      dispatch(actions.updateShipToSuccess(res));
      dispatchAlert(
        openAlertMessage({
          message: 'Successfully',
          color: 'success',
          title: 'Success'
        })
      );
      callback();
    } catch (error: any) {
      dispatch(actions.updateShipToFailure(error.message));
      dispatchAlert(
        openAlertMessage({
          message: 'Error',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const handleShipConfirmation = async () => {
    try {
      dispatch(actions.shipConfirmationRequest());
      await shipConfirmationService(+orderDetail?.id);
      dispatch(actions.shipConfirmationSuccess());
      dispatchAlert(
        openAlertMessage({
          message: 'Ship Confirmation Successfully',
          color: 'success',
          title: 'Success'
        })
      );
      const dataOrder = await getOrderDetailServer(+params?.id);
      dispatch(actions.setOrderDetail(dataOrder));
    } catch (error: any) {
      dispatch(actions.shipConfirmationFailure(error?.message));
      dispatchAlert(
        openAlertMessage({
          message: error?.message || 'Ship Confirmation Error',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const handleInvoiceConfirmation = async () => {
    try {
      if (!orderDetail?.invoice_order) {
        dispatchAlert(
          openAlertMessage({
            message: 'Invoice not found',
            color: 'error',
            title: 'Fail'
          })
        );
        return;
      }

      dispatch(actions.invoiceConfirmationRequest());
      await invoiceConfirmationService(orderDetail.invoice_order.id);
      dispatch(actions.invoiceConfirmationSuccess());
      dispatchAlert(
        openAlertMessage({
          message: 'Invoice Confirmation Successfully',
          color: 'success',
          title: 'Success'
        })
      );
      const dataOrder = await getOrderDetailServer(+params?.id);
      dispatch(actions.setOrderDetail(dataOrder));
    } catch (error: any) {
      dispatch(actions.invoiceConfirmationFailure(error?.message));
      dispatchAlert(
        openAlertMessage({
          message: error?.message || 'Invoice Confirmation Error',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const getOrderDetail = useCallback(async () => {
    try {
      dispatch(actions.getOrderDetailRequest());
      const response = await getNewOrderDetailService(+params?.id);
      dispatch(actions.getOrderDetailFromSuccess(response));
    } catch (error: any) {
      dispatch(actions.getOrderDetailFailure(error.message));
    }
  }, [dispatch, params?.id]);

  const handleSubmitBackOrder = async (data: {
    estimated_ship_date: string;
    estimated_delivery_date: string;
  }) => {
    try {
      dispatch(actions.updateBackOrderRequest());
      await importBackOrderService({
        ...data,
        estimated_ship_date: convertDateToISO8601(data.estimated_ship_date),
        estimated_delivery_date: convertDateToISO8601(data.estimated_delivery_date),
        id: +orderDetail.id
      });

      handleToggleModal();
      const dataOrder = await getOrderDetailServer(+params?.id);
      dispatch(actions.setOrderDetail(dataOrder));
      dispatchAlert(
        openAlertMessage({
          message: 'Successfully',
          color: 'success',
          title: 'Success'
        })
      );
      dispatch(actions.updateBackOrderSuccess());
    } catch (error: any) {
      dispatch(actions.updateBackOrderFailure(error.message));
      dispatchAlert(
        openAlertMessage({
          message: error?.message || 'Something went wrong!',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const handleGetRetailerWarehouse = useCallback(async () => {
    try {
      dispatchWarehouse(actionsWarehouse.getRetailerWarehouseRequest());
      const res = await servicesWarehouse.getRetailerWarehouseService({
        search: debouncedSearchTermWarehouse,
        page: 0,
        rowsPerPage: -1
      });
      dispatchWarehouse(actionsWarehouse.getRetailerWarehouseSuccess(res));
    } catch (error) {
      dispatchWarehouse(actionsWarehouse.getRetailerWarehouseFailure(error));
    }
  }, [dispatchWarehouse, debouncedSearchTermWarehouse]);

  const onReturnOrder = () => {
    setIsReturnOrder({
      isOpen: true,
      orderReturn: null
    });
  };

  const onResetReference = async () => {
    try {
      dispatch(actions.resetReferenceRequest());
      await resetReferenceService(+orderDetail?.id);
      dispatch(actions.resetReferenceSuccess());
      const dataOrder = await getOrderDetailServer(+params?.id);
      dispatch(actions.setOrderDetail(dataOrder));
      dispatchAlert(
        openAlertMessage({
          message: 'Reset Reference to Default Successfully',
          color: 'success',
          title: 'Success'
        })
      );
    } catch (error: any) {
      dispatch(actions.resetReferenceFailure());
      dispatchAlert(
        openAlertMessage({
          message: error?.message || 'Reset Reference to Default Fail',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  useEffect(() => {
    if (orderDetail?.warehouse) {
      setValueWarehouse('retailer_warehouse', {
        value: orderDetail?.warehouse?.id,
        label: orderDetail?.warehouse?.name
      });
    }
  }, [JSON.stringify(orderDetail)]);

  useEffect(() => {
    if (orderDetail && orderDetail?.vendor_warehouse_id === retailerWarehouse?.label) {
      setIsMatchWarehouse(true);
    } else {
      setIsMatchWarehouse(false);
    }
  }, [JSON.stringify(orderDetail), retailerWarehouse]);

  useEffect(() => {
    getOrderDetail();
    handleGetRetailerWarehouse();
  }, [getOrderDetail, handleGetRetailerWarehouse]);

  useEffect(() => {
    handleGetRetailerCarrier();
  }, [handleGetRetailerCarrier]);

  useEffect(() => {
    handleGetShippingService();
  }, [handleGetShippingService]);

  useEffect(() => {
    if (
      (currentOrganization && dayjs(tokenExpTime).utc().isBefore(currentLocalTime)) ||
      (currentOrganization && tokenExpTime === null)
    ) {
      dispatchAlert(
        openAlertMessage({
          color: 'warning',
          customTimeHide: 6000,
          action: (
            <div className="flex max-w-[374px] items-start pr-[20px]">
              {tokenExpTime === null ? (
                <span className="text-[16px] leading-6 text-white">
                  You have not login the QuickBooks account. Please click the{' '}
                  <span
                    className="cursor-pointer whitespace-normal break-words text-[16px] text-dodgeBlue underline"
                    onClick={() => handleGetInvoice()}
                  >
                    LINK
                  </span>{' '}
                  to access your QuickBooks account to continue
                </span>
              ) : (
                <span className="text-[16px] leading-6 text-white">
                  Your QuickBooks access code has expired.
                  <br /> Kindly click the{' '}
                  <span
                    className="cursor-pointer whitespace-normal break-words text-[16px] text-dodgeBlue underline"
                    onClick={() => handleGetInvoice()}
                  >
                    LINK
                  </span>{' '}
                  to sign in to QuickBooks once again
                </span>
              )}
            </div>
          )
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization, dispatchAlert, handleGetInvoice, organizations]);

  useEffect(() => {
    if (dataPrintAfterShip?.itemsLabel?.length > 0) {
      const promises = dataPrintAfterShip.itemsLabel.map(async (item: ShipmentPackages) => {
        if (item?.package_document.includes('UPS')) {
          const imagePrint = item?.package_document;

          return new Promise(async (resolve) => {
            imageUrlToBase64(imagePrint, async (base64Data) => {
              if (base64Data) {
                const resetBase64Image = await generateNewBase64s(base64Data);
                resolve({ orderId: +item?.package, data: resetBase64Image });
              } else {
                resolve(null);
              }
            });
          });
        } else {
          const labelObject = {
            orderId: +item?.package,
            data: item?.package_document
          };
          return labelObject;
        }
      });

      Promise.all(promises)
        .then((results) => {
          const filteredResults = results.filter((result) => result !== null);
          setAllLabelAfterShip(filteredResults as Label[]);
        })
        .catch((error) => {
          console.error('Error processing images:', error);
        });
    }
  }, [dataPrintAfterShip]);

  useEffect(() => {
    const returnOrderId = window.localStorage.getItem('return_order_id');
    if (returnOrderId && returnOrderId !== params?.id) {
      localStorage.removeItem('return_order_id');
    } else if (returnOrderId) {
      setIsReturnOrder({
        isOpen: true,
        orderReturn: null
      });
    }
  }, [params?.id]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main className="relative mb-2">
          {isReturnOrder.isOpen ? (
            <ReturnOrder
              setIsReturnOrder={setIsReturnOrder}
              isReturnOrder={isReturnOrder}
              dataRetailerWarehouse={dataRetailerWarehouse}
              items={orderDetail.items}
              onGetRetailerWarehouse={handleGetRetailerWarehouse}
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="my-4 text-lg font-semibold">
                  Purchase Order: #{orderDetail.po_number}
                </h2>

                <div className="flex items-center gap-2">
                  <Button
                    disabled={isStatusBtnReturnOrder}
                    className="bg-gey100 dark:bg-gunmetal"
                    onClick={onReturnOrder}
                  >
                    {orderDetail?.status === ORDER_STATUS.Returned
                      ? 'The order was returned'
                      : 'Return Order'}
                  </Button>
                  <div className="mx-1 h-8 w-[1px] bg-santaGrey" />
                  <ButtonDropdown
                    className={clsx({
                      'w-[158px]': isLoadingAcknowledge
                    })}
                    isLoading={isLoadingAcknowledge}
                    disabled={isLoadingAcknowledge || isStatusBtnAcknowledge}
                    color="bg-primary500"
                    onClick={handleSubmitAcknowledge}
                    dropdown={
                      <Button
                        className="w-full"
                        disabled={isStatusBtnBackOrder}
                        onClick={handleToggleModal}
                      >
                        BackOrder
                      </Button>
                    }
                  >
                    Acknowledge
                  </ButtonDropdown>

                  <Button
                    isLoading={isLoadingShipConfirmation}
                    disabled={
                      isLoadingShipConfirmation ||
                      isStatusBtnShipmentConfirmation ||
                      Boolean(!retailerWarehouse)
                    }
                    color="bg-primary500"
                    className="flex items-center py-2 text-white max-sm:hidden"
                    onClick={handleShipConfirmation}
                  >
                    Shipment Confirmation
                  </Button>

                  <Button
                    disabled={isStatusBtnInvoiceConfirmation || !orderDetail?.invoice_order?.id}
                    color="bg-primary500"
                    className="flex items-center py-2 text-white max-sm:hidden"
                    onClick={handleInvoiceConfirmation}
                  >
                    Invoice Confirmation
                  </Button>
                </div>
              </div>
              <div className="h-full">
                <div className="grid w-full grid-cols-3 gap-2">
                  <div className="col-span-2 flex flex-col gap-2">
                    <Package
                      detail={orderDetail}
                      orderPackageNotShip={orderPackageNotShip}
                      itemShippingService={itemShippingService}
                      setIsCheckDimensions={setIsCheckDimensions}
                    />
                    <ShipConfirmation
                      isPrintAll={isPrintAll}
                      handleChangeIsPrintAll={handleChangeIsPrintAll}
                      orderDetail={orderDetail}
                    />
                    {orderDetail.id && (
                      <Recipient
                        retailerCarrier={retailerCarrier}
                        detail={orderDetail}
                        onVerifyAddress={handleVerifyAddress}
                        onUpdateShipTo={handleUpdateShipTo}
                        isLoadingVerify={isLoadingVerify}
                        isLoadingRevert={isLoadingRevert}
                        isLoadingUpdateShipTo={isLoadingUpdateShipTo}
                        isResidential={isResidential}
                      />
                    )}
                    <Cost orderDetail={orderDetail} />
                    <OrderItem
                      items={orderDetail.items}
                      retailer={orderDetail?.batch?.retailer as never}
                    />
                    <NoteOrder orderDetail={orderDetail} />
                    {orderDetail?.status === ORDER_STATUS.Returned && (
                      <>
                        {orderDetail?.order_returns?.map((item) => (
                          <div key={item.id}>
                            <OrderReturn
                              orderReturn={item as TypeOrderReturn}
                              setIsReturnOrder={setIsReturnOrder}
                            />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <General detail={orderDetail} orderDate={orderDetail.order_date} />
                    <form noValidate onSubmit={handleSubmitWarehouse(handleSaveWarehouse)}>
                      <Warehouse
                        errors={errorsWarehouse}
                        control={controlWarehouse}
                        dataRetailerWarehouse={dataRetailerWarehouse}
                        isLoadingUpdateWarehouseOrder={isLoadingUpdateWarehouseOrder}
                        orderDetail={orderDetail}
                        itemWarehousesNotSelect={itemWarehousesNotSelect}
                        retailerWarehouse={retailerWarehouse}
                        isMatchWarehouse={isMatchWarehouse}
                        setValueWarehouse={setValueWarehouse}
                        onGetRetailerWarehouse={handleGetRetailerWarehouse}
                      />
                    </form>

                    <ConfigureShipment
                      dataShippingService={dataShippingService}
                      isLoadingShipment={isLoadingShipment}
                      detail={orderDetail}
                      dataRetailerCarrier={dataRetailerCarrier.results}
                      onGetRetailerCarrier={handleGetRetailerCarrier}
                      handleSearchService={handleSearchService}
                      onShipment={handleCreateShipment}
                      handleChangeRetailerCarrier={handleChangeRetailerCarrier}
                      handleChangeShippingService={handleChangeShippingService}
                      setItemShippingService={setItemShippingService}
                      isCheckDimensions={isCheckDimensions}
                      isLoadingResetRef={isLoadingResetRef}
                      onResetReference={onResetReference}
                    />
                    <ManualShip
                      detail={orderDetail}
                      isLoading={isLoadingCreateManualShip}
                      onCreateManualShip={handleCreateManualShip}
                    />
                    <SubmitInvoice
                      isLoading={isLoadingCreateInvoice}
                      handleGetInvoice={handleGetInvoice}
                      orderDetail={orderDetail}
                    />
                    <CancelOrder
                      items={orderDetail.items}
                      detail={orderDetail}
                      retailerWarehouse={retailerWarehouse}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      )}

      <Modal open={openModal} onClose={handleToggleModal}>
        <BackOrder
          isLoadingBackOrder={isLoadingBackOrder}
          onClose={handleToggleModal}
          onSubmitBackOrder={handleSubmitBackOrder}
        />
      </Modal>

      <ModalPrintAfterShip
        open={isOpenModalAfterPrint}
        allLabelAfterShip={allLabelAfterShip}
        onClose={handleCloseModalPrintAfterShip}
        orderDetail={orderDetail}
        dataPrintAfterShip={dataPrintAfterShip as any}
      />
    </>
  );
};

export default OrderDetailContainer;
