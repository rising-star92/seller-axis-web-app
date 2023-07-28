import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useMemo, useState } from 'react';

import IconPlus from 'public/plus-icon.svg';
import DeleteIcon from 'public/delete.svg';
import PenIcon from '/public/pencil.svg';

import { useStore as useStoreAlert } from '@/components/ui/Alert/context/hooks';
import { useStore } from '@/app/(withHeader)/orders/context';
import * as actions from '@/app/(withHeader)/orders/context/action';
import * as services from '@/app/(withHeader)/orders/fetch';
import Autocomplete from '@/components/ui/Autocomplete';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import usePagination from '@/hooks/usePagination';
import { Modal } from '@/components/ui/Modal';
import useSearch from '@/hooks/useSearch';
import { Button } from '@/components/ui/Button';
import { isEmptyObject } from '@/utils/utils';
import { OrderItemPackages, OrderPackages } from '@/app/(withHeader)/orders/interface';

import { ProductPackageSelect, headerTableEditPack } from '../../constants';

const schema = yup.object().shape({
  qty: yup
    .number()
    .typeError('Quantity is required')
    .min(0, 'Quantity must be greater than or equal to 0'),
  product: yup
    .object()
    .shape({
      label: yup.string().nonNullable(),
      value: yup.number().nonNullable()
    })
    .required('Product rule is required')
});

type RowPack = {
  openModalEditPack: boolean;
  dataPackRow: OrderPackages;
  handleCloseModalEditPack: () => void;
};

export default function ModalEditRowPack({
  openModalEditPack,
  dataPackRow,
  handleCloseModalEditPack
}: RowPack) {
  const {
    state: { isLoadingItemPackages },
    dispatch
  } = useStore();
  const { dispatch: dispatchAlert } = useStoreAlert();

  const { debouncedSearchTerm, handleSearch } = useSearch();
  const { page, rowsPerPage, onPageChange } = usePagination();

  const dataDefaultProductPackRow = useMemo(() => {
    return dataPackRow?.order_item_packages;
  }, [dataPackRow]);

  const [dataTable, setDataTable] = useState<OrderItemPackages[]>([]);
  const [itemActive, setItemActive] = useState<number | undefined | null>();
  const [itemChange, setItemChange] = useState<OrderItemPackages | null>();
  const [dataProducts, setDataProducts] = useState<OrderItemPackages[]>([]);

  const compareArrays = useMemo(() => {
    if (dataPackRow?.order_item_packages?.length !== dataTable?.length) {
      return false;
    }
    for (let i = 0; i < dataPackRow?.order_item_packages?.length; i++) {
      const itemDataPackRow = dataPackRow?.order_item_packages[i];
      const itemDataTable = dataTable[i];
      if (
        itemDataPackRow?.id !== itemDataTable?.id ||
        itemDataPackRow?.retailer_purchase_order_item?.product_alias?.sku !==
          itemDataTable?.retailer_purchase_order_item?.product_alias?.sku ||
        itemDataPackRow?.quantity !== itemDataTable?.quantity
      ) {
        return false;
      }
    }
    return true;
  }, [dataPackRow?.order_item_packages, dataTable]);

  const defaultValues = useMemo(() => {
    return {
      qty: 0,
      product: null
    };
  }, []);

  const {
    control,
    formState: { errors },
    clearErrors,
    watch,
    setValue
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver<any>(schema)
  });
  const product = watch('product');
  const qty = watch('qty');

  const isQtyEqualToQuantity = useMemo(() => {
    if (itemChange?.quantity === +qty) {
      return true;
    }
    return false;
  }, [itemChange?.quantity, qty]);

  const totalQtyExcludingCurrent = useMemo(() => {
    return dataTable?.reduce(
      (acc: number, item: OrderItemPackages) =>
        item?.id !== product?.value ? acc + item?.quantity : acc,
      0
    );
  }, [dataTable, product?.value]);

  const newTotalQty = useMemo(() => {
    return totalQtyExcludingCurrent + +qty;
  }, [qty, totalQtyExcludingCurrent]);

  const isMaxQtyReached = useMemo(() => {
    return newTotalQty > dataPackRow?.box?.max_quantity;
  }, [dataPackRow?.box?.max_quantity, newTotalQty]);

  const handleEditPack = (item: OrderItemPackages, index: number) => {
    setValue('qty', item?.quantity);
    setValue('product', {
      value: item?.id,
      label: item?.retailer_purchase_order_item?.product_alias?.sku
    });
    setItemChange(item);

    setItemActive(index);
  };

  const handleCancelEdit = () => {
    setValue('qty', 0);
    setValue('product', '');
    setItemActive(null);
    clearErrors();
  };

  const handleDeletePack = (indexItem: number) => {
    const newArray = dataTable?.filter((item: OrderItemPackages) => item?.id !== indexItem);
    setDataTable(newArray);
  };

  const handleAddProduct = (qty: number, product: ProductPackageSelect) => {
    const newObj = {
      id: product?.value,
      retailer_purchase_order_item: {
        product_alias: {
          sku: product?.label
        }
      },
      quantity: +qty
    };
    setDataTable([...dataTable, newObj]);
  };

  const handleSbEdit = (
    qty: number,
    itemActive: number | undefined | null,
    product: ProductPackageSelect
  ) => {
    const updatedItems = dataTable?.map((item: OrderItemPackages) =>
      item?.id === itemActive
        ? {
            ...item,
            quantity: +qty,
            retailer_purchase_order_item: {
              product_alias: {
                sku: product?.label
              }
            }
          }
        : item
    );
    setDataTable(updatedItems);
    setValue('qty', 0);
    setValue('product', '');
    setItemActive(null);
  };

  const closeModal = () => {
    handleCloseModalEditPack();
    clearErrors();
    setDataTable(dataPackRow?.order_item_packages);
    setItemActive(null);
    setItemChange(null);
    setValue('product', '');
    setDataProducts([]);
  };

  const handleSubmitEdit = async () => {};

  const renderBodyTable = useMemo(() => {
    return dataTable?.map((row: OrderItemPackages) => ({
      id: row?.id,
      product: row?.retailer_purchase_order_item?.product_alias?.sku || '-',
      qty: row.quantity || '-',
      action: (
        <div className="flex items-center justify-center">
          <Button onClick={() => handleEditPack(row, row.id)} startIcon={<PenIcon />}>
            {''}
          </Button>
          <Button onClick={() => handleDeletePack(row.id)} startIcon={<DeleteIcon />}>
            {''}
          </Button>
        </div>
      )
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTable]);

  useEffect(() => {
    if (isEmptyObject(dataPackRow)) {
      setDataTable([]);
    } else {
      setDataTable(dataPackRow?.order_item_packages);
    }
  }, [dataPackRow]);

  useEffect(() => {
    if (dataTable?.length > 0) {
      const itemQty = dataTable?.find((item: OrderItemPackages) => item?.id === product?.value);
      setItemChange(itemQty);
      setValue('qty', itemQty?.quantity);
      setItemActive(itemQty?.id);
    }
  }, [dataTable, product?.value, setValue]);

  useEffect(() => {
    const productDeleted = [] as OrderItemPackages[];
    dataDefaultProductPackRow?.forEach((defaultProduct: OrderItemPackages) => {
      if (!dataTable?.some((data: OrderItemPackages) => data?.id === defaultProduct?.id)) {
        productDeleted?.push(defaultProduct);
      }
    });
    setDataProducts(productDeleted);
  }, [dataDefaultProductPackRow, dataTable]);

  return (
    <Modal open={openModalEditPack} title={`Box ${dataPackRow?.box?.name}`} onClose={closeModal}>
      <form className="mb-[24px] flex flex-col gap-4">
        <div>
          <Controller
            control={control}
            name="product"
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={
                  dataProducts?.map((item: OrderItemPackages) => ({
                    value: item?.id,
                    label: item?.retailer_purchase_order_item?.product_alias?.sku
                  })) || []
                }
                disabled={
                  dataProducts?.length === 0 &&
                  dataDefaultProductPackRow?.length === dataTable?.length
                }
                handleChangeText={handleSearch}
                required
                addNew={false}
                label="Product"
                name="product"
                placeholder="Select product"
                error={errors.product?.message}
              />
            )}
          />
        </div>
        <div>
          <Controller
            control={control}
            name="qty"
            render={({ field }) => (
              <Input
                {...field}
                disabled={!itemActive && dataDefaultProductPackRow?.length === dataTable?.length}
                label="Quantity"
                type="number"
                required
                name="qty"
                placeholder="0"
                error={errors.qty?.message}
              />
            )}
          />
        </div>
        <div className="flex justify-end">
          {typeof itemActive === 'number' ? (
            <>
              <Button
                className="mr-4"
                onClick={handleCancelEdit}
                disabled={isEmptyObject(product)}
                color="bg-gey100 dark:bg-gunmetal"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSbEdit(qty, itemActive, product)}
                disabled={
                  isEmptyObject(product) ||
                  !isEmptyObject(errors) ||
                  isMaxQtyReached ||
                  isQtyEqualToQuantity
                }
                color="bg-primary500"
              >
                Update {`${product?.label || ''}`}
              </Button>
            </>
          ) : (
            <Button
              startIcon={<IconPlus />}
              type="button"
              onClick={() => handleAddProduct(qty, product)}
              disabled={
                isEmptyObject(product) ||
                !isEmptyObject(errors) ||
                isMaxQtyReached ||
                isQtyEqualToQuantity
              }
              color="bg-primary500"
            >
              Add
            </Button>
          )}
        </div>
      </form>
      <Table
        itemActive={itemActive}
        columns={headerTableEditPack}
        loading={false}
        rows={renderBodyTable as never}
        isPagination={false}
        onPageChange={onPageChange}
      />
      <div className="flex justify-end pt-4">
        <Button disabled={compareArrays} color="bg-primary500" onClick={handleSubmitEdit}>
          Update Box {`${dataPackRow?.box?.name}`}
        </Button>
      </div>
    </Modal>
  );
}
