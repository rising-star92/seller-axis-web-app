/* eslint-disable react-hooks/exhaustive-deps */
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import PlusIcon from 'public/plus-icon.svg';
import { Input } from '@/components/ui/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { schemaDisputeReason } from '../../../constants';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import * as actions from '@/app/(withHeader)/orders/context/action';
import * as services from '@/app/(withHeader)/orders/fetch';
import { useStore as useStoreAlert } from '@/components/ui/Alert/context/hooks';
import { useStore } from '@/app/(withHeader)/orders/context';
import { Button } from '@/components/ui/Button';
import General from '../General';
import CardToggle from '@/components/ui/CardToggle';
import Autocomplete from '@/components/ui/Autocomplete';
import { Options } from '@/app/(withHeader)/orders/containers';
import SectionOrderReturn from './components/SectionOrderReturn';

import type {
  ListRetailerWarehouse,
  RetailerWarehouse
} from '@/app/(withHeader)/warehouse/interface';
import ModalConfirmReturnOrder from './components/ModalConfirmReturnOrder';
import useToggleModal from '@/hooks/useToggleModal';
import Icons from '@/components/Icons';
import { openAlertMessage } from '@/components/ui/Alert/context/action';

import type {
  ItemOrder,
  OrderItemReturn,
  OrderReturnNote,
  TrackingNumber,
  TypeOrderReturn
} from '../../../interface';
import { ORDER_STATUS } from '@/constants';
import { convertDateToISO8601 } from '@/utils/utils';

type ReturnOrder = {
  setIsReturnOrder: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      orderReturn: TypeOrderReturn | null;
    }>
  >;
  isReturnOrder: {
    isOpen: boolean;
    orderReturn: TypeOrderReturn | null;
  };
  dataRetailerWarehouse: ListRetailerWarehouse;
  onGetRetailerWarehouse: () => Promise<void>;
  items: ItemOrder[];
};

export default function ReturnOrder(props: ReturnOrder) {
  const { setIsReturnOrder, dataRetailerWarehouse, items, onGetRetailerWarehouse, isReturnOrder } =
    props;
  const {
    state: {
      orderDetail,
      isLoadingCreateReturnNote,
      isLoadMoreShippingCarrier,
      dataShippingCarrier
    },
    dispatch
  } = useStore();
  const returnOrderId = window.localStorage.getItem('return_order_id');
  const { page: pageShippingCarrier, onPageChange: onPageChangeShippingCarrier } = usePagination();
  const { debouncedSearchTerm: debouncedSearchShipping, handleSearch: handleSearchShipping } =
    useSearch('shipping');
  const { dispatch: dispatchAlert } = useStoreAlert();
  const { openModal, handleToggleModal } = useToggleModal();

  const isStatusReturned = useMemo(() => {
    return orderDetail?.status?.includes(ORDER_STATUS.Returned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderDetail?.status)]);

  const itemNoteReturn = useMemo(() => {
    if (isReturnOrder.orderReturn?.id) {
      return orderDetail?.order_returns?.find((item) => item.id === isReturnOrder.orderReturn?.id);
    }
  }, [isReturnOrder, orderDetail?.order_returns]);

  const defaultWarehouse = useMemo(() => {
    return dataRetailerWarehouse?.results?.find(
      (item) => item.id === orderDetail?.batch?.retailer?.default_warehouse?.id
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dataRetailerWarehouse?.results), JSON.stringify(orderDetail)]);

  const [valueWarehouse, setValueWarehouse] = useState<{
    warehouse: Options | null;
    shipping_carrier: Options | null;
  }>({
    warehouse: null,
    shipping_carrier: null
  });
  const [listReturnNote, setListReturnNote] = useState<OrderReturnNote[]>([]);
  const [itemsOrderReturn, setItemsOrderReturn] = useState<OrderItemReturn[]>([]);
  const [isErrorMessage, setIsErrorMessage] = useState<boolean>(false);
  const [isErrorZeroMessage, setIsErrorZeroMessage] = useState<boolean>(false);
  const [isErrorWarehouse, setIsWarehouse] = useState<boolean>(false);
  const [isDisputeInReturn, setIsDisputeInReturn] = useState<boolean>(false);
  const [listItemInput, setListItemInput] = useState<{ id: string; value: string }[]>([]);
  const [isErrorRequiredField, setIsErrorRequiredField] = useState<boolean>(false);

  const onAddFieldInput = () => {
    const newId = listItemInput.length > 0 ? listItemInput[0].id + 1 : crypto.randomUUID();

    setListItemInput([{ id: newId, value: '' }, ...listItemInput]);
  };

  const onDeleteFieldInput = (id: string) => {
    setListItemInput((prevList) => prevList.filter((field) => field.id !== id));
  };

  const onInputChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    setListItemInput((prevList) =>
      prevList.map((field) => (field.id === id ? { ...field, value: e.target.value } : field))
    );
  };

  const defaultValues = {
    dispute_id: '',
    reason: null,
    date: dayjs(new Date()).format('YYYY-MM-DD')
  };

  const {
    control: controlDispute,
    watch: watchDispute,
    reset,
    formState: { errors: errorsDispute }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver<any>(schemaDisputeReason)
  });
  const disputeId = watchDispute('dispute_id');
  const reason = watchDispute('reason');
  const date = watchDispute('date');

  const handleChangeWarehouse = (name: string, value: Options) => {
    setIsWarehouse(false);
    setValueWarehouse({
      ...valueWarehouse,
      [name]: value
    });
  };

  const onCancelReturnOrder = () => {
    returnOrderId && localStorage.removeItem('return_order_id');
    setIsReturnOrder({
      isOpen: false,
      orderReturn: null
    });
    setIsErrorMessage(false);
    setIsErrorZeroMessage(false);
    setIsErrorRequiredField(false);
    reset();
  };

  const onOpenModalConfirm = () => {
    const checkDamageQty = itemsOrderReturn.some(
      (item) => item.damaged + item?.return_qty > item?.ship_qty_ordered
    );

    const checkQtyZero = itemsOrderReturn.every(
      (item) => item.return_qty === 0 && item.damaged === 0
    );

    if (checkDamageQty) {
      setIsErrorMessage(true);
      setIsErrorZeroMessage(false);
    } else if (checkQtyZero) {
      setIsErrorZeroMessage(true);
      setIsErrorMessage(false);
    } else if (listItemInput?.length === 0) {
      setIsErrorRequiredField(true);
    } else {
      setIsErrorMessage(false);
      setIsErrorZeroMessage(false);
    }

    if (!valueWarehouse.warehouse) {
      setIsWarehouse(true);
    } else if (
      !checkDamageQty &&
      valueWarehouse.warehouse &&
      !checkQtyZero &&
      listItemInput?.length > 0
    ) {
      setIsErrorMessage(false);
      setIsErrorZeroMessage(false);
      setIsErrorRequiredField(false);
      handleToggleModal();
    }
  };

  const onConfirmReturnOrder = async () => {
    const listItem = itemsOrderReturn?.map((itemOrderReturn) => {
      const correspondingOrderItem = itemNoteReturn?.order_returns_items.find(
        (orderItem) => orderItem.item.id === itemOrderReturn.id
      );

      return {
        id: correspondingOrderItem ? correspondingOrderItem.id : null,
        reason: itemOrderReturn?.reason,
        return_qty: itemOrderReturn?.return_qty,
        damaged_qty: itemOrderReturn?.damaged || 0
      };
    });
    if (isStatusReturned) {
      const bodyUpdate = {
        notes: listReturnNote?.map((item) => ({ details: item?.details, id: +item?.id })),
        order_returns_items: listItem,
        tracking_number: listItemInput?.map((item) => item.value),
        service:
          valueWarehouse.shipping_carrier?.label === 'Other'
            ? valueWarehouse.shipping_carrier?.value
            : valueWarehouse.shipping_carrier?.label,
        warehouse: valueWarehouse.warehouse?.value
      };
      try {
        dispatch(actions.updateReturnRequest());
        await services.updateReturnService(
          bodyUpdate as never,
          isReturnOrder.orderReturn?.id as never
        );
        dispatch(actions.updateReturnSuccess());
        dispatchAlert(
          openAlertMessage({
            message: 'Update Return Note Successfully',
            color: 'success',
            title: 'Success'
          })
        );
        const dataOrder = await services.getOrderDetailServer(+orderDetail?.id);
        dispatch(actions.setOrderDetail(dataOrder));
        returnOrderId && localStorage.removeItem('return_order_id');
        setIsReturnOrder({
          isOpen: false,
          orderReturn: null
        });
      } catch (error: any) {
        dispatch(actions.updateReturnFailure());
        dispatchAlert(
          openAlertMessage({
            message: error?.message || 'Update Return Note Fail',
            color: 'error',
            title: 'Fail'
          })
        );
      }
    } else {
      const body = {
        notes: listReturnNote?.map((item) => ({ details: item?.details })),
        order_returns_items: itemsOrderReturn?.map((item) => ({
          reason: item?.reason,
          return_qty: item?.return_qty,
          damaged_qty: item?.damaged || 0,
          item: item?.id
        })),
        tracking_number: listItemInput?.map((item) => item.value),
        service: valueWarehouse.shipping_carrier
          ? valueWarehouse.shipping_carrier?.label === 'Other'
            ? valueWarehouse.shipping_carrier?.value
            : valueWarehouse.shipping_carrier?.label
          : null,
        order: orderDetail?.id,
        warehouse: valueWarehouse.warehouse?.value,
        dispute_id: disputeId || null,
        dispute_reason: disputeId ? reason?.value : null,
        dispute_at: disputeId ? convertDateToISO8601(date) : null,
        dispute_status: disputeId ? 'Dispute requested' : null,
        updated_dispute_at: disputeId ? dayjs().toISOString() : null
      };
      try {
        dispatch(actions.createReturnNoteRequest());
        await services.createReturnNoteService(body as never);
        dispatch(actions.createReturnNoteSuccess());
        dispatchAlert(
          openAlertMessage({
            message: 'Create Return Note Successfully',
            color: 'success',
            title: 'Success'
          })
        );
        const dataOrder = await services.getOrderDetailServer(+orderDetail?.id);
        dispatch(actions.setOrderDetail(dataOrder));
        returnOrderId && localStorage.removeItem('return_order_id');
        setIsReturnOrder({
          isOpen: false,
          orderReturn: null
        });
      } catch (error: any) {
        dispatch(actions.createReturnNoteFailure());
        dispatchAlert(
          openAlertMessage({
            message: error?.message || 'Create Return Note Fail',
            color: 'error',
            title: 'Fail'
          })
        );
      }
    }
  };

  const handleGetShippingCarrier = useCallback(async () => {
    try {
      dispatch(actions.getShippingCarrierRequest());
      const res = await services.getShippingCarrierService({
        is_active: '%20',
        search: debouncedSearchShipping || '',
        page: 0,
        rowsPerPage: 10
      });
      dispatch(actions.getShippingCarrierSuccess(res));
    } catch (error: any) {
      dispatch(actions.getShippingCarrierFailure());
    }
  }, [dispatch, debouncedSearchShipping]);

  const onViewMoreRetailer = async () => {
    const currentPage = pageShippingCarrier + 1;
    try {
      dispatch(actions.loadMoreShippingCarrierRequest());
      const res = await services.getShippingCarrierService({
        is_active: '%20',
        search: debouncedSearchShipping || '',
        page: currentPage,
        rowsPerPage: 10
      });
      dispatch(actions.loadMoreShippingCarrierSuccess(res));
      onPageChangeShippingCarrier(currentPage + 1);
    } catch (error: any) {
      dispatch(actions.loadMoreShippingCarrierFailure());
    }
  };

  const onDeleteDisputeRequest = () => {
    setIsDisputeInReturn(false);
    reset();
  };

  useEffect(() => {
    if (isStatusReturned) {
      const itemShippingCarrier = dataShippingCarrier?.results?.find(
        (item) => item?.name === isReturnOrder?.orderReturn?.service
      );
      setValueWarehouse({
        warehouse: {
          value: isReturnOrder?.orderReturn?.warehouse?.id,
          label: isReturnOrder?.orderReturn?.warehouse?.name
        },
        shipping_carrier: isReturnOrder?.orderReturn?.service
          ? itemShippingCarrier
            ? {
                value: itemShippingCarrier?.id,
                label: itemShippingCarrier?.name
              }
            : {
                value: isReturnOrder?.orderReturn?.service,
                label: 'Other'
              }
          : null
      } as never);
      const updatedList = isReturnOrder?.orderReturn?.tracking_number?.map(
        (trackingNumber: TrackingNumber) => ({
          id: crypto.randomUUID(),
          value: trackingNumber
        })
      );
      setListItemInput(updatedList as never);
    } else {
      setValueWarehouse({
        warehouse: {
          value: defaultWarehouse
            ? (defaultWarehouse?.id as string)
            : (orderDetail?.warehouse?.id as string),
          label: defaultWarehouse
            ? (defaultWarehouse?.name as string)
            : (orderDetail?.warehouse?.name as string)
        },
        shipping_carrier: null
      });
    }
  }, [
    isReturnOrder,
    defaultWarehouse,
    dataShippingCarrier,
    isStatusReturned,
    JSON.stringify(orderDetail)
  ]);

  useEffect(() => {
    handleGetShippingCarrier();
  }, [handleGetShippingCarrier]);

  useEffect(() => {
    if (isStatusReturned) {
      const detailListNote = orderDetail?.order_returns
        ?.find((item) => item.id === isReturnOrder.orderReturn?.id)
        ?.notes?.map((note) => ({
          id: note?.id,
          first_name: note?.user?.first_name,
          last_name: note?.user?.last_name,
          details: note?.details,
          created_at: dayjs(note?.created_at).format('YYYY-MM-DD')
        }));
      setListReturnNote(detailListNote as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReturnOrder, JSON.stringify(orderDetail?.order_returns), isStatusReturned]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="my-4 text-lg font-semibold">Purchase Order: #{orderDetail.po_number}</h2>
      </div>
      <div className="h-full">
        <div className="grid w-full grid-cols-3 gap-2">
          <div className="col-span-2 flex flex-col gap-2">
            <SectionOrderReturn
              items={items}
              isDisputeInReturn={isDisputeInReturn}
              setIsDisputeInReturn={setIsDisputeInReturn}
              listReturnNote={listReturnNote}
              setListReturnNote={setListReturnNote}
              itemsOrderReturn={itemsOrderReturn}
              setItemsOrderReturn={setItemsOrderReturn}
              isErrorMessage={isErrorMessage}
              isErrorZeroMessage={isErrorZeroMessage}
              controlDispute={controlDispute}
              errorsDispute={errorsDispute}
              isStatusReturned={isStatusReturned}
              isReturnOrder={isReturnOrder}
              onDeleteDisputeRequest={onDeleteDisputeRequest}
            />
          </div>
          <div className="flex flex-col gap-2">
            <General detail={orderDetail} orderDate={orderDetail.order_date} />
            <CardToggle
              iconTitle={<Icons glyph="intersect" />}
              title="Configure Return Shipment"
              className="grid w-full grid-cols-1 gap-2"
            >
              <Autocomplete
                options={
                  dataRetailerWarehouse?.results?.map((item: RetailerWarehouse) => ({
                    value: item?.id,
                    label: item?.name
                  })) || []
                }
                required
                label="Return to"
                name="warehouse"
                placeholder="Select Retailer Warehouse"
                value={valueWarehouse.warehouse}
                pathRedirect="/warehouse/create"
                onReload={onGetRetailerWarehouse}
                onChange={(value: Options) => handleChangeWarehouse('warehouse', value)}
                error={isErrorWarehouse && 'Warehouse is required'}
              />
              <div className="py-4">
                <Autocomplete
                  options={[
                    ...(dataShippingCarrier?.results || [])?.map((item) => ({
                      value: item?.id,
                      label: item?.name
                    })),
                    {
                      label: 'Other',
                      value: ''
                    }
                  ]}
                  label="Shipping carrier"
                  name="shipping_carrier"
                  placeholder="Select shipping carrier"
                  value={valueWarehouse.shipping_carrier}
                  addNew={false}
                  onChange={(value: Options) => handleChangeWarehouse('shipping_carrier', value)}
                  handleViewMore={onViewMoreRetailer}
                  handleChangeText={handleSearchShipping}
                  isLoadMore={isLoadMoreShippingCarrier}
                  disableLodMore={dataShippingCarrier?.next}
                  otherElement={
                    <Input
                      value={valueWarehouse?.shipping_carrier?.value || ''}
                      placeholder="Enter shipping carrier"
                      className="mt-3"
                      onChange={(event: any) =>
                        setValueWarehouse({
                          ...valueWarehouse,
                          shipping_carrier: {
                            label: 'Other',
                            value: event?.target?.value
                          }
                        })
                      }
                    />
                  }
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    Tracking number
                    <span className="ml-1 text-red">*</span>
                  </div>
                  <Button color="bg-primary500" onClick={onAddFieldInput}>
                    <div className="flex items-center">
                      <PlusIcon />
                    </div>
                  </Button>
                </div>
                {isErrorRequiredField && (
                  <span className="text-sm text-red">Tracking number is required</span>
                )}
                {listItemInput?.length > 0 && (
                  <>
                    {listItemInput?.map((item) => (
                      <div key={item.id} className="flex w-full items-center justify-between py-3">
                        <div className="w-full">
                          <Input
                            placeholder="Enter tracking number"
                            value={item.value}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              onInputChange(item.id, e)
                            }
                          />
                        </div>
                        <Icons
                          glyph="delete"
                          onClick={() => onDeleteFieldInput(item.id)}
                          className="ml-[8px] cursor-pointer"
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardToggle>
            <div className="flex items-center justify-end gap-2">
              <Button className="bg-gey100 dark:bg-gunmetal" onClick={onCancelReturnOrder}>
                Cancel
              </Button>
              <Button className="bg-primary500 text-white" onClick={onOpenModalConfirm}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ModalConfirmReturnOrder
        open={openModal}
        onModalToggle={handleToggleModal}
        onConfirmReturnOrder={onConfirmReturnOrder}
        isLoadingCreateReturnNote={isLoadingCreateReturnNote}
      />
    </>
  );
}
