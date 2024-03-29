'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import omit from 'lodash/omit';

import { DATA_Dimension_Unit } from '@/app/(withHeader)/package-rules/constants';
import useSearch from '@/hooks/useSearch';
import usePagination from '@/hooks/usePagination';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Autocomplete from '@/components/ui/Autocomplete';
import { Input } from '@/components/ui/Input';
import { useStore as useStoreAlert } from '@/components/ui/Alert/context/hooks';
import { openAlertMessage } from '@/components/ui/Alert/context/action';
import { Select } from '@/components/ui/Select';

import { schemaBox } from '../../constants';
import { FormCreateBox } from '../../interface';
import { useStoreBox } from '../../context';
import {
  createBoxFailure,
  createBoxRequest,
  createBoxSuccess,
  getBarcodeSizeFailure,
  getBarcodeSizeRequest,
  getBarcodeSizeSuccess,
  getDetailBoxFailure,
  getDetailBoxRequest,
  getDetailBoxSuccess,
  updateBoxFailure,
  updateBoxRequest,
  updateBoxSuccess
} from '../../context/action';
import {
  createBoxService,
  getBarcodeSizeService,
  getDetailBoxService,
  updateBoxService
} from '../../fetch';

const NewBoxContainer = () => {
  const params = useParams();
  const router = useRouter();
  const { page, rowsPerPage, onPageChange } = usePagination();
  const { debouncedSearchTerm, handleSearch } = useSearch('barcode-size');
  const { dispatch: dispatchAlert } = useStoreAlert();

  const {
    state: { errorMessage, barcodeSize, isLoadingCreate, detailBox },
    dispatch: boxDispatch
  } = useStoreBox();

  const valueBarcodeSize = useMemo(() => {
    if (detailBox) {
      return barcodeSize.find((item) => item.id === detailBox.barcode_size);
    }
  }, [barcodeSize, detailBox]);

  const defaultValues = useMemo(() => {
    return {
      name: '',
      length: 0,
      width: 0,
      height: 0,
      dimension_unit: 'in',
      barcode_size: null
    };
  }, []);

  const {
    control,
    setValue,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver<any>(schemaBox)
  });

  const handleCreateBox = async (data: FormCreateBox) => {
    try {
      if (params?.id) {
        const body = omit(data, ['created_at', 'updated_at', 'id']);
        boxDispatch(updateBoxRequest());
        await updateBoxService(
          {
            ...body,
            barcode_size: body.barcode_size?.value
          },
          +params?.id
        );
        boxDispatch(updateBoxSuccess());
        router.push('/box');
      } else {
        boxDispatch(createBoxRequest());
        await createBoxService({
          ...data,
          barcode_size: +data.barcode_size.value
        });
        boxDispatch(createBoxSuccess());
        router.push('/box');
      }
    } catch (error: any) {
      if (params?.id) {
        boxDispatch(updateBoxFailure(error.message));
      } else {
        boxDispatch(createBoxFailure(error.message));
        dispatchAlert(
          openAlertMessage({
            message: errorMessage,
            color: 'error',
            title: 'Fail'
          })
        );
      }
    }
  };

  const handleGetBarcodeSize = useCallback(async () => {
    try {
      boxDispatch(getBarcodeSizeRequest());
      const data = await getBarcodeSizeService({
        search: debouncedSearchTerm,
        page,
        rowsPerPage
      });
      boxDispatch(getBarcodeSizeSuccess(data?.results));
    } catch (error: any) {
      boxDispatch(getBarcodeSizeFailure(error.message));
    }
  }, [boxDispatch, debouncedSearchTerm, page, rowsPerPage]);

  useEffect(() => {
    handleGetBarcodeSize();
  }, [handleGetBarcodeSize]);

  const getDetailBox = async () => {
    try {
      boxDispatch(getDetailBoxRequest());
      const response = await getDetailBoxService(+params?.id);
      boxDispatch(getDetailBoxSuccess(response));
    } catch (error: any) {
      boxDispatch(getDetailBoxFailure(error.message));
    }
  };

  useEffect(() => {
    params?.id && getDetailBox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  useEffect(() => {
    if (detailBox?.id) {
      Object?.keys(detailBox)?.forEach((key) => {
        setValue(key, detailBox[key]);
      });
      setValue('barcode_size', { value: detailBox.barcode_size, label: valueBarcodeSize?.name });
    }
  }, [setValue, detailBox, valueBarcodeSize?.name]);

  return (
    <main>
      <h2 className="my-4 text-lg font-semibold">{params?.id ? 'Update Box' : 'Create Box'}</h2>
      <form
        noValidate
        onSubmit={handleSubmit(handleCreateBox)}
        className="grid w-full grid-cols-1 gap-4"
      >
        <div className="grid w-full grid-cols-1 gap-4">
          <Card>
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-1">
              <div className="w-[50%]">
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter name box"
                      label="Name"
                      required
                      name="name"
                      error={errors.name?.message}
                    />
                  )}
                />
              </div>
              <div className="w-[50%]">
                <Controller
                  control={control}
                  name="length"
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Length"
                      required
                      type="number"
                      name="length"
                      error={errors.length?.message}
                    />
                  )}
                />
              </div>
              <div className="w-[50%]">
                <Controller
                  control={control}
                  name="width"
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Width"
                      required
                      type="number"
                      name="width"
                      error={errors.width?.message}
                    />
                  )}
                />
              </div>
              <div className="w-[50%]">
                <Controller
                  control={control}
                  name="height"
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Height"
                      required
                      type="number"
                      name="height"
                      error={errors.height?.message}
                    />
                  )}
                />
              </div>
              <div className="w-[50%]">
                <Controller
                  control={control}
                  name="dimension_unit"
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={DATA_Dimension_Unit}
                      label="Dimension unit"
                      name="dimension_unit"
                      error={errors.dimension_unit?.message?.toString()}
                    />
                  )}
                />
              </div>

              <div className="w-[50%]">
                <Controller
                  control={control}
                  name="barcode_size"
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={
                        barcodeSize?.map((item) => ({
                          value: item?.id,
                          label: item?.name
                        })) || []
                      }
                      handleChangeText={handleSearch}
                      required
                      label="Barcode size"
                      name="barcode_size"
                      placeholder="Select barcode size"
                      onReload={handleGetBarcodeSize}
                      pathRedirect="/barcode-size/create"
                      error={errors.barcode_size?.message}
                    />
                  )}
                />
              </div>
            </div>
          </Card>

          <div className="mb-2 flex flex-col items-end">
            <Button
              type="submit"
              isLoading={isLoadingCreate}
              disabled={isLoadingCreate}
              className="bg-primary500"
            >
              {params?.id ? 'Update Box' : 'Create Box'}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default NewBoxContainer;
