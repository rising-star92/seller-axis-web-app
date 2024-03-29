'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { useSearchParams } from 'next/navigation';

import { useStore as useStoreAlert } from '@/components/ui/Alert/context/hooks';
import { SubBar } from '@/components/common/SubBar';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSelectTable from '@/hooks/useSelectTable';
import Table from '../components/TableInventory';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { headerTable } from '../constants';
import IconAction from 'public/three-dots.svg';
import { useStore } from '../../product-aliases/context';
import {
  getProductAliasRequest,
  getProductAliasSuccess,
  getProductAliasFailure,
  updateProductStaticBulkFailure,
  updateProductStaticBulkRequest,
  updateProductStaticBulkSuccess,
  updateLiveProductAliasFailure,
  updateLiveProductAliasRequest,
  updateLiveProductAliasSuccess,
  downloadInventoryRequest,
  downloadInventorySuccess,
  downloadInventoryFailure
} from '../../product-aliases/context/action';
import { ProductAlias, ResDownloadInventory, Retailer } from '../interface';
import { getProductAliasService } from '../fetch';
import {
  downloadInventoryService,
  updateLiveProductAliasService,
  updateProductStaticBulkService
} from '../../product-aliases/fetch';
import { convertDateToISO8601 } from '@/utils/utils';

export default function InventoryContainer() {
  const searchParams = useSearchParams();
  const sortBy = searchParams.get('sort_by');

  const { dispatch: dispatchAlert } = useStoreAlert();
  const {
    state: { isLoading, dataProductAlias, isLoadingUpdateProductStatic, isLoadingUpdateLive },
    dispatch: productAliasDispatch
  } = useStore();
  const { selectedItems, onSelectAll, onSelectItem, setSelectedItems } = useSelectTable({
    data: dataProductAlias?.results as []
  });
  const { search, debouncedSearchTerm, handleSearch } = useSearch('product-alias');
  const { page, rowsPerPage, onPageChange, onChangePerPage, setCurrentPage } = usePagination();

  const [dataInventory, setDataInventory] = useState<ProductAlias[]>(dataProductAlias?.results);
  const [changeQuantity, setChangeQuantity] = useState<any>({
    update_quantity: false,
    next_available_date: false,
    next_available_qty: false
  });
  const [isUseLiveQuantity, setIsLiveQuantity] = useState<boolean>(false);
  const [changedIdsQuantity, setChangedIdsQuantity] = useState<number[]>([]);

  const fileDownload = useMemo(() => {
    return dataInventory?.filter(
      (item) =>
        selectedItems?.includes(+item.id) && item?.last_queue_history?.includes('s3.amazonaws.com/')
    );
  }, [dataInventory, selectedItems]);

  const isValueUseLiveQuantity = useMemo(() => {
    return dataInventory?.some((item) => item?.is_live_data === true);
  }, [dataInventory]);

  const handleCancel = useCallback(() => {
    setChangeQuantity(false);
    setIsLiveQuantity(false);
    setSelectedItems([]);
    setChangedIdsQuantity([]);
    handleGetProductAlias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveChanges = useCallback(async () => {
    const dataProductStatic = dataInventory
      ?.filter((item) => item?.retailer_warehouse_products?.length > 0)
      ?.filter((item) => changedIdsQuantity?.includes(+item.id));

    const retailer_warehouse_products = dataProductStatic
      ?.flatMap((item) => item?.retailer_warehouse_products)
      ?.filter(
        (item) =>
          item?.product_warehouse_statices && item?.product_warehouse_statices.hasOwnProperty('id')
      );

    const bodyProductStatic = retailer_warehouse_products?.map((item) => ({
      id: item?.product_warehouse_statices?.id,
      next_available_date: item?.product_warehouse_statices?.next_available_date
        ? convertDateToISO8601(item?.product_warehouse_statices?.next_available_date)
        : null,
      next_available_qty: item?.product_warehouse_statices?.next_available_qty,
      product_warehouse_id: item?.product_warehouse_statices?.product_warehouse,
      qty_on_hand:
        item?.product_warehouse_statices?.update_quantity ||
        item?.product_warehouse_statices?.qty_on_hand,
      status: item?.product_warehouse_statices?.status,
      created_at: item?.product_warehouse_statices?.created_at,
      updated_at: item?.product_warehouse_statices?.updated_at
    }));

    try {
      productAliasDispatch(updateProductStaticBulkRequest());
      await updateProductStaticBulkService(bodyProductStatic);
      productAliasDispatch(updateProductStaticBulkSuccess());
    } catch (error: any) {
      productAliasDispatch(updateProductStaticBulkFailure(error?.detail));
    }
    handleCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInventory, productAliasDispatch]);

  const handleDownload = async () => {
    const dataDownloadInventory = dataInventory?.filter((item) =>
      selectedItems?.includes(+item.id)
    );
    try {
      productAliasDispatch(downloadInventoryRequest());
      const res = await downloadInventoryService(
        dataDownloadInventory?.map((item) => item?.retailer?.id) as never
      );
      productAliasDispatch(downloadInventorySuccess());
      res?.results?.forEach((item: ResDownloadInventory) => {
        const link = document.createElement('a');
        link.href = item?.result_url as string;
        link.target = '_blank';
        link.download = 'inventory.xml';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (error: any) {
      productAliasDispatch(downloadInventoryFailure(error?.message));
    }
  };

  const handleItemLive = () => {
    setChangeQuantity(false);
    setIsLiveQuantity(true);
    setDataInventory((prevData) => {
      return prevData?.map((item) => {
        if (selectedItems?.includes(+item?.id)) {
          return {
            ...item,
            is_live_data: true
          };
        }
        return item;
      });
    });
  };

  const handleNotItemLive = () => {
    setChangeQuantity(true);
    setIsLiveQuantity(true);
    setDataInventory((prevData) => {
      return prevData?.map((item) => {
        if (selectedItems?.includes(+item?.id)) {
          return {
            ...item,
            is_live_data: false
          };
        }
        return item;
      });
    });
  };

  const handleToggleLiveQuantity = (indexItem: number) => {
    setIsLiveQuantity(true);
    setDataInventory((prevTableData) => {
      const updatedData = prevTableData?.map((item, i) =>
        i === indexItem
          ? {
              ...item,
              is_live_data: !item?.is_live_data
            }
          : item
      );
      const changedId = updatedData[indexItem]?.id;
      if (changedId && !selectedItems.includes(+changedId)) {
        setSelectedItems((prevIds) => [...prevIds, changedId] as never);
      }
      return updatedData;
    });
  };

  const handleGetProductAlias = useCallback(async () => {
    try {
      productAliasDispatch(getProductAliasRequest());
      const dataProduct = await getProductAliasService({
        search: debouncedSearchTerm,
        page,
        rowsPerPage,
        sortBy: sortBy || '-created_at'
      });
      productAliasDispatch(getProductAliasSuccess(dataProduct));
    } catch (error) {
      productAliasDispatch(getProductAliasFailure(error));
    }
  }, [productAliasDispatch, page, debouncedSearchTerm, rowsPerPage, sortBy]);

  const handleQuantityLive = useCallback(async () => {
    const dataLiveProduct = dataInventory?.filter((item) => selectedItems?.includes(+item.id));

    const body = dataLiveProduct?.map((item) => ({
      id: item.id,
      is_live_data: item.is_live_data,
      merchant_sku: item.merchant_sku,
      sku: item.sku,
      vendor_sku: item.vendor_sku,
      product_id: item.product?.id,
      retailer_id: item.retailer?.id
    }));
    try {
      productAliasDispatch(updateLiveProductAliasRequest());
      await updateLiveProductAliasService(body);
      productAliasDispatch(updateLiveProductAliasSuccess());
    } catch (error: any) {
      productAliasDispatch(updateLiveProductAliasFailure(error?.message));
    }
    handleCancel();
  }, [dataInventory, handleCancel, selectedItems, productAliasDispatch]);

  useEffect(() => {
    handleGetProductAlias();
  }, [handleGetProductAlias]);

  useEffect(() => {
    if (dataProductAlias) {
      setDataInventory(dataProductAlias?.results);
    }
  }, [dataProductAlias]);

  useEffect(() => {
    const checkLiveStatus = () => {
      for (let i = 0; i < dataProductAlias?.results?.length; i++) {
        if (dataProductAlias?.results[i]?.is_live_data !== dataInventory[i]?.is_live_data) {
          setIsLiveQuantity(true);
          return;
        }
      }
      setIsLiveQuantity(false);
    };

    checkLiveStatus();
  }, [dataInventory, dataProductAlias?.results]);

  return (
    <main className="flex h-full flex-col">
      <div className="flex h-full flex-col gap-[18px]">
        <div className="flex content-end items-center">
          <SubBar
            setCurrentPage={setCurrentPage}
            search={search}
            isDownload={true}
            onSearch={handleSearch}
            changeQuantity={changeQuantity}
            handleCancel={handleCancel}
            isLoadingUpdateProductStatic={isLoadingUpdateProductStatic}
            customHeaderInventory={
              <>
                {changeQuantity?.update_quantity ||
                changeQuantity?.next_available_date ||
                changeQuantity?.next_available_qty ? (
                  <div className="flex items-center">
                    <Button
                      color="bg-primary500"
                      className={'mr-[8px] flex items-center  py-2 max-sm:hidden'}
                      onClick={handleCancel}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">Cancel</span>
                      </div>
                    </Button>

                    <Button
                      color="bg-primary500"
                      className={'flex items-center py-2  max-sm:hidden'}
                      onClick={handleSaveChanges}
                      isLoading={isLoadingUpdateProductStatic}
                      disabled={isLoadingUpdateProductStatic}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">Submit</span>
                      </div>
                    </Button>
                  </div>
                ) : (
                  isUseLiveQuantity && (
                    <div className="ml-[8px] flex items-center">
                      <Button
                        color="bg-primary500"
                        className={'flex items-center py-2  max-sm:hidden'}
                        onClick={handleQuantityLive}
                        isLoading={isLoadingUpdateLive}
                        disabled={isLoadingUpdateLive}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">Submit live quantity</span>
                        </div>
                      </Button>
                    </div>
                  )
                )}
              </>
            }
          />
        </div>
        <div className="h-full">
          <Table
            onChangePerPage={onChangePerPage}
            columns={headerTable}
            isPagination
            isSelect={true}
            loading={isLoading}
            changedIdsQuantity={changedIdsQuantity}
            setChangedIdsQuantity={setChangedIdsQuantity}
            changeQuantity={changeQuantity}
            setChangeQuantity={setChangeQuantity}
            selectedItems={selectedItems}
            selectAllTable={onSelectAll}
            selectItemTable={onSelectItem}
            totalCount={dataProductAlias.count}
            siblingCount={1}
            onPageChange={onPageChange}
            currentPage={page + 1}
            pageSize={rowsPerPage}
            dataInventory={dataInventory as ProductAlias[]}
            handleToggleLiveQuantity={handleToggleLiveQuantity}
            setDataInventory={setDataInventory}
            selectAction={
              <Dropdown
                className="left-3 top-[-10px] w-[180px] dark:bg-gunmetal"
                mainMenu={<IconAction />}
              >
                <div className="rounded-lg ">
                  <Button className="w-full hover:bg-neutralLight" onClick={handleItemLive}>
                    <span className="items-start text-lightPrimary  dark:text-santaGrey">
                      Use live inventory
                    </span>
                  </Button>
                  <Button
                    className={clsx('w-full', {
                      'hover:bg-neutralLight': isValueUseLiveQuantity
                    })}
                    onClick={handleNotItemLive}
                    disabled={!isValueUseLiveQuantity}
                  >
                    <span className="items-start text-lightPrimary dark:text-santaGrey">
                      Not use live inventory
                    </span>
                  </Button>
                  <Button
                    className={clsx('w-full', {
                      'hover:bg-neutralLight': fileDownload?.length !== 0
                    })}
                    onClick={handleDownload}
                    disabled={fileDownload.length === 0}
                  >
                    <span className="items-start text-lightPrimary  dark:text-santaGrey">
                      Download XML
                    </span>
                  </Button>
                </div>
              </Dropdown>
            }
          />
        </div>
      </div>
    </main>
  );
}
