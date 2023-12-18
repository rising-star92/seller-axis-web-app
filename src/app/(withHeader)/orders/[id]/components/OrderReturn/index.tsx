import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { TextArea } from '@/components/ui/TextArea';
import { yupResolver } from '@hookform/resolvers/yup';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  headerTableNote,
  headerTableSectionOrderReturn,
  schemaNote
} from '@/app/(withHeader)/orders/constants';
import CardToggle from '@/components/ui/CardToggle';
import { Table } from '@/components/ui/Table';
import Icons from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import IconDelete from 'public/delete.svg';
import PenIcon from '/public/pencil.svg';
import IconAction from 'public/three-dots.svg';
import { convertDateToISO8601, truncateText } from '@/utils/utils';
import { openAlertMessage } from '@/components/ui/Alert/context/action';
import { useStore as useStoreAlert } from '@/components/ui/Alert/context/hooks';
import { useStore } from '@/app/(withHeader)/orders/context';
import * as actions from '@/app/(withHeader)/orders/context/action';
import IconPlus from 'public/plus-icon.svg';
import {
  addReturnNoteService,
  deleteReturnNoteService,
  getOrderDetailServer,
  updateDisputeReturnService,
  updateReturnNoteService
} from '../../../fetch';

import type {
  Notes,
  OrderReturnsItems,
  TypeOrderReturn
} from '@/app/(withHeader)/orders/interface';
import { Radius } from '@/components/ui/Radius';
import useToggleModal from '@/hooks/useToggleModal';
import ModalConfirmDisputeReturn from '../ModalConfirmDisputeReturn';

type OrderReturn = {
  orderReturn: TypeOrderReturn;
};

export default function OrderReturn(props: OrderReturn) {
  const { orderReturn } = props;
  const {
    state: {
      isUpdateReturnOrder,
      isDeleteReturnOrder,
      isAddReturnOrder,
      orderDetail,
      isLoadingUpdateDispute
    },
    dispatch
  } = useStore();
  const { dispatch: dispatchAlert } = useStoreAlert();
  const { openModal, handleToggleModal } = useToggleModal();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isAddNew, setIsAddNew] = useState<boolean>(false);
  const [itemEditNote, setItemEditNote] = useState<Notes | null>(null);
  const [isDispute, setIsDispute] = useState<boolean>(false);
  const [dateDispute, setDateDispute] = useState(dayjs(new Date()).format('YYYY-MM-DD'));

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue
  } = useForm({
    defaultValues: {
      details: ''
    },
    resolver: yupResolver<any>(schemaNote)
  });

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const renderBodyTableOrderReturn = orderReturn?.order_returns_items?.map(
    (row: OrderReturnsItems) => {
      return {
        id: row?.id || '',
        merchant_sku: row?.item?.merchant_sku || '-',
        product_alias: row?.item?.product_alias?.sku ? (
          <span
            className="text-dodgeBlue underline"
            onClick={() =>
              window.open(`/product-aliases/${row?.item?.product_alias?.id}`, '_blank')
            }
          >
            {row?.item?.product_alias?.sku}
          </span>
        ) : (
          '-'
        ),
        return_qty: row?.return_qty || 0,
        damaged: row?.damaged_qty || 0,
        reason: row?.reason || '-'
      };
    }
  );

  const renderBodyTableNoteReturn = orderReturn?.notes?.map((row: Notes) => ({
    id: row?.id,
    time_created: row?.created_at ? dayjs(row.created_at).format('MM/DD/YYYY') : '-',
    from: (
      <p className="w-fit">
        {row?.user?.first_name || '-'} {row?.user?.last_name || '-'}
      </p>
    ),
    details: (
      <div className="h-fit max-w-[580px] items-start whitespace-normal break-words">
        {row?.details ? (
          <p>
            {(!expanded && <span>{truncateText(row?.details, 210)}</span>) || row?.details}
            {row?.details?.length > 210 && (
              <span onClick={toggleExpanded} className="text-dodgeBlue">
                {' '}
                {!expanded ? 'Show more' : 'Show less'}
              </span>
            )}
          </p>
        ) : (
          '-'
        )}
      </div>
    ),
    action: (
      <div
        className="flex items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <Dropdown
          classButton="justify-center"
          mainMenu={<IconAction />}
          className="bottom-0 right-3 w-[100px] dark:bg-gunmetal"
        >
          <div className="z-50 rounded-lg">
            <Button onClick={() => handleEditRow(row)}>
              <PenIcon />
              <span className="text-lightPrimary dark:text-santaGrey">Edit</span>
            </Button>
            <Button
              isLoading={isDeleteReturnOrder}
              disabled={isDeleteReturnOrder}
              onClick={() => handleDeleteItem(row?.id)}
            >
              <IconDelete />
              <span className="text-lightPrimary dark:text-santaGrey">Delete</span>
            </Button>
          </div>
        </Dropdown>
      </div>
    )
  }));

  const handleDeleteItem = async (id: number) => {
    try {
      dispatch(actions.deleteReturnNoteRequest());
      await deleteReturnNoteService(id);
      dispatch(actions.deleteReturnNoteSuccess(id));
      dispatchAlert(
        openAlertMessage({
          message: 'Delete return note successfully',
          color: 'success',
          title: 'Success'
        })
      );
    } catch (error: any) {
      dispatch(actions.deleteReturnNoteFailure());
      dispatchAlert(
        openAlertMessage({
          message: error?.message || 'Delete return note fail',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const handleEditRow = async (item: Notes) => {
    setValue('details', item?.details);
    setItemEditNote(item);
    setIsAddNew(true);
  };

  const handleCancelAddNew = () => {
    setIsAddNew(false);
    setItemEditNote(null);
    reset();
  };

  const handleSubmitNote = async (data: { details: string }) => {
    const body = {
      details: data.details,
      order_return: orderReturn?.id
    };
    if (itemEditNote) {
      try {
        dispatch(actions.updateReturnNoteRequest());
        const res = await updateReturnNoteService(body, itemEditNote?.id);
        dispatch(actions.updateReturnNoteSuccess(res));
        dispatchAlert(
          openAlertMessage({
            message: 'Update return note successfully',
            color: 'success',
            title: 'Success'
          })
        );
      } catch (error: any) {
        dispatch(actions.updateReturnNoteFailure());
        dispatchAlert(
          openAlertMessage({
            message: error?.message || 'Update return note fail',
            color: 'error',
            title: 'Fail'
          })
        );
      }
    } else {
      try {
        dispatch(actions.addReturnNoteRequest());
        const res = await addReturnNoteService(body);
        dispatch(actions.addReturnNoteSuccess(res));
        dispatchAlert(
          openAlertMessage({
            message: 'Add return note successfully',
            color: 'success',
            title: 'Success'
          })
        );
      } catch (error: any) {
        dispatch(actions.addReturnNoteFailure());
        dispatchAlert(
          openAlertMessage({
            message: error?.message || 'Add return note fail',
            color: 'error',
            title: 'Fail'
          })
        );
      }
    }

    handleCancelAddNew();
  };

  const onConfirmDisputeReturn = async () => {
    const body = {
      is_dispute: !isDispute,
      dispute_date: convertDateToISO8601(dateDispute)
    };
    try {
      dispatch(actions.updateDisputeRequest());
      await updateDisputeReturnService(body, orderReturn?.id);
      dispatch(actions.updateDisputeSuccess());
      const dataOrder = await getOrderDetailServer(+orderDetail?.id);
      dispatch(actions.setOrderDetail(dataOrder));
      dispatchAlert(
        openAlertMessage({
          message: 'Update dispute successfully',
          color: 'success',
          title: 'Success'
        })
      );
      handleToggleModal();
    } catch (error: any) {
      dispatch(actions.updateReturnNoteFailure());
      dispatchAlert(
        openAlertMessage({
          message: error?.message || 'Update dispute fail',
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const onChangeDispute = () => {
    handleToggleModal();
    setIsDispute(isDispute);
  };

  useEffect(() => {
    orderReturn?.is_dispute ? setIsDispute(true) : setIsDispute(false);
  }, [orderReturn?.is_dispute]);

  return (
    <CardToggle
      iconTitle={<Icons glyph="product" />}
      title="Order Return"
      className="grid w-full grid-cols-1 gap-2"
    >
      <div className="mb-4">
        <div className="mb-4 flex items-center">
          <Radius checked={isDispute} onChange={onChangeDispute} />
          <div className="ml-2 flex items-center">
            <span>Dispute </span>
            {isDispute && (
              <span className="ml-2">{dayjs(orderReturn?.dispute_date).format('MM/DD/YYYY')}</span>
            )}
          </div>
        </div>

        <Table
          columns={headerTableSectionOrderReturn}
          loading={false}
          rows={renderBodyTableOrderReturn}
          totalCount={0}
          siblingCount={1}
          onPageChange={() => {}}
          currentPage={10}
          pageSize={10}
        />
      </div>

      {!isAddNew && (
        <div className="mb-4 flex w-full items-center justify-between">
          <span>
            Return Note {orderReturn?.notes?.length ? `(${orderReturn?.notes?.length})` : ''}
          </span>
          <Button
            onClick={() => setIsAddNew(true)}
            className="bg-primary500 text-white"
            startIcon={<IconPlus />}
          >
            Add note order return
          </Button>
        </div>
      )}

      {isAddNew && (
        <form noValidate onSubmit={handleSubmit(handleSubmitNote)}>
          <Controller
            control={control}
            name="details"
            render={({ field }) => (
              <TextArea
                {...field}
                rows={3}
                required
                label="Detail"
                name="details"
                placeholder="Enter detail"
                error={errors.details?.message}
              />
            )}
          />
          <div className="flex justify-end py-4">
            <Button
              type="button"
              onClick={handleCancelAddNew}
              className="mr-4 bg-gey100 dark:bg-gunmetal"
            >
              Cancel
            </Button>
            {itemEditNote ? (
              <Button
                isLoading={isUpdateReturnOrder}
                disabled={isUpdateReturnOrder}
                className="bg-primary500 text-white"
              >
                Update Note
              </Button>
            ) : (
              <Button
                isLoading={isAddReturnOrder}
                disabled={isAddReturnOrder}
                className="bg-primary500 text-white"
              >
                Add Note
              </Button>
            )}
          </div>
        </form>
      )}

      <Table
        columns={headerTableNote}
        loading={false}
        rows={renderBodyTableNoteReturn || []}
        totalCount={0}
        siblingCount={1}
        onPageChange={() => {}}
        currentPage={10}
        pageSize={10}
        isBorder={false}
      />
      <ModalConfirmDisputeReturn
        isDispute={isDispute}
        open={openModal}
        onModalToggle={handleToggleModal}
        onConfirmDisputeReturn={onConfirmDisputeReturn}
        isLoadingUpdateDispute={isLoadingUpdateDispute}
        dateDispute={dateDispute}
        setDateDispute={setDateDispute}
      />
    </CardToggle>
  );
}
