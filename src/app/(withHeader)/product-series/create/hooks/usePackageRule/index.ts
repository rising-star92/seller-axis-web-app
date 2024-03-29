import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { useStore as useStorePackageRule } from '@/app/(withHeader)/package-rules/context';
import { useStore as useStoreAlert } from '@/components/ui/Alert/context/hooks';
import * as PackageRuleActions from '@/app/(withHeader)/package-rules/context/action';
import * as packageRuleServices from '@/app/(withHeader)/package-rules/fetch';
import { DataPackageRule } from '@/app/(withHeader)/products/interface';
import { openAlertMessage } from '@/components/ui/Alert/context/action';
import { schemaPackageRule } from '@/app/(withHeader)/products/constants';

const usePackageRule = ({ dataProductSeriesDetail }: any) => {
  const { dispatch: dispatchPackageRule } = useStorePackageRule();
  const { dispatch: dispatchAlert } = useStoreAlert();

  const [isUpdate, setIsUpdate] = useState(false);
  const [dataUpdate, setDataUpdate] = useState<DataPackageRule>({
    box: {
      label: '',
      value: ''
    },
    id: '',
    max_quantity: 0
  });

  const defaultValuesPackageRule = useMemo(() => {
    return {
      box: null,
      max_quantity: 0,
      items: []
    };
  }, []);

  const {
    control: controlPackageRule,
    formState: { errors: errorsPackageRule },
    handleSubmit: handleSubmitPackageRule,
    setValue: setValuePackageRule,
    getValues: getValuesPackageRule,
    watch: watchPackageRule,
    reset: resetPackageRule,
    clearErrors: clearErrorsPackageRule
  } = useForm({
    defaultValues: defaultValuesPackageRule,
    mode: 'onChange',
    resolver: yupResolver<any>(schemaPackageRule)
  });

  const items = watchPackageRule('items');
  const box = watchPackageRule('box');
  const max_quantity = watchPackageRule('max_quantity');

  const handleCancelUpdate = () => {
    setValuePackageRule('box', null);
    setValuePackageRule('max_quantity', 0);
    clearErrorsPackageRule();
    setIsUpdate(false);
  };

  const handleCreatePackageRule = async () => {
    const formatDataBody = {
      product_series: +dataProductSeriesDetail.id,
      max_quantity: +max_quantity,
      box: box.value
    };
    try {
      dispatchPackageRule(PackageRuleActions.createPackageRuleRequest());
      const dataProductStatic = await packageRuleServices.createPackageRuleService(formatDataBody);
      const newData = [
        ...items,
        {
          id: dataProductStatic.id,
          box,
          max_quantity: +max_quantity
        }
      ];
      setValuePackageRule('items', newData);

      resetPackageRule({
        ...getValuesPackageRule(),
        box: null,
        max_quantity: 0
      });
      dispatchPackageRule(PackageRuleActions.createPackageRuleSuccess());
      dispatchAlert(
        openAlertMessage({
          message: 'Successfully',
          color: 'success',
          title: 'Success'
        })
      );
    } catch (error: any) {
      dispatchPackageRule(PackageRuleActions.createPackageRuleFailure(error.message));
      dispatchAlert(
        openAlertMessage({
          message: error.message,
          color: 'error',
          title: 'Fail'
        })
      );
    }
  };

  const handleDeletePackageRule = async (row: DataPackageRule) => {
    try {
      dispatchPackageRule(PackageRuleActions.deletePackageRuleRequest());
      await packageRuleServices.deletePackageRuleService(+row.id);

      const newData = [...items];

      const newDataUpdate = newData.filter((item) => item.id !== row.id);

      setValuePackageRule('items', newDataUpdate);
      dispatchPackageRule(PackageRuleActions.deletePackageRuleSuccess(+row.id));
    } catch (error: any) {
      dispatchPackageRule(PackageRuleActions.deletePackageRuleFailure(error.message));
    }
  };

  const handleUpdatePackageRule = async () => {
    try {
      dispatchPackageRule(PackageRuleActions.updatePackageRuleRequest());
      await packageRuleServices.updatePackageRuleService(
        {
          max_quantity: +max_quantity,
          box: box.value,
          product_series: +dataProductSeriesDetail.id
        },
        +dataUpdate.id
      );

      const newData = [...items];

      const newDataUpdate = newData.map((item) =>
        item.id === dataUpdate.id
          ? {
              ...item,
              box,
              max_quantity: +max_quantity
            }
          : item
      );

      setValuePackageRule('items', newDataUpdate);
      resetPackageRule({
        ...getValuesPackageRule(),
        box: null,
        max_quantity: 0
      });
      setIsUpdate(false);
      setDataUpdate({
        box: {
          label: '',
          value: ''
        },
        id: '',
        max_quantity: 0
      });
      dispatchPackageRule(PackageRuleActions.updatePackageRuleSuccess());
    } catch (error: any) {
      dispatchPackageRule(PackageRuleActions.updatePackageRuleFailure(error.message));
    }
  };

  const handleEditPackageRule = (data: DataPackageRule) => {
    setDataUpdate(data);
    setIsUpdate(true);
    setValuePackageRule('max_quantity', data.max_quantity);
    setValuePackageRule('box', data.box);
  };

  return {
    isUpdate,
    dataUpdate,
    items,
    box,
    max_quantity,
    errorsPackageRule,
    controlPackageRule,
    resetPackageRule,
    handleCancelUpdate,
    handleCreatePackageRule,
    handleDeletePackageRule,
    handleUpdatePackageRule,
    handleEditPackageRule,
    handleSubmitPackageRule
  };
};

export default usePackageRule;
