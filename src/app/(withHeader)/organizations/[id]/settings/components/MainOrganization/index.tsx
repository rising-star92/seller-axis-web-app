import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { schemaOrganization } from '@/app/(withHeader)/organizations/constants';
import { useStore } from '@/app/(withHeader)/organizations/context';
import * as action from '@/app/(withHeader)/organizations/context/action';
import * as service from '@/app/(withHeader)/organizations/fetch';
import { OrganizationDetailType } from '@/app/(withHeader)/organizations/interfaces';
import { UploadImageCom } from '@/components/common/UploadImage';
import Autocomplete from '@/components/ui/Autocomplete';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import useHandleImage from '@/hooks/useHandleImage';
import { TimeZone } from '@/utils/timezones';

const MainOrganization = ({ id }: { id: string }) => {
  const {
    state: { isLoading, organizations },
    dispatch
  } = useStore();

  const defaultValues: OrganizationDetailType = useMemo(() => {
    return {
      name: organizations[id]?.name || '',
      avatar: organizations[id]?.avatar || '',
      description: organizations[id]?.description || '',
      address: organizations[id]?.address || '',
      email: organizations[id]?.email || '',
      phone: organizations[id]?.phone || '',
      status: organizations[id]?.status || '',
      timezone: organizations[id]?.timezone || ''
    };
  }, [id, organizations]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<OrganizationDetailType>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver<any>(schemaOrganization)
  });

  const { file, image, onDeleteImage, handleImage } = useHandleImage();

  const handleUpdateOrganization = async (data: OrganizationDetailType) => {
    try {
      dispatch(action.updateOrganizationRequest());
      const dataOrg = await service.updateOrganizationsService({
        ...data,
        id: organizations[id]?.id
      });
      dispatch(action.updateOrganizationSuccess(dataOrg));
    } catch (error: any) {
      reset(organizations[id]);
      dispatch(action.updateOrganizationFail(error));
    }
  };

  const onSubmitClassification = async (data: OrganizationDetailType) => {
    handleUpdateOrganization({
      ...data,
      avatar: file
    });
  };

  useEffect(() => {
    id && reset(organizations[id]);
  }, [id, organizations, reset]);

  return (
    <Card>
      <div className="flex w-full justify-center">
        <UploadImageCom
          label="Logo"
          image={image}
          onChangeImage={handleImage}
          onDeleteImage={onDeleteImage}
          name="logo"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmitClassification)}>
        <div className="my-4">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                label="Name"
                isRequired
                name="name"
                placeholder="Enter Name"
                error={errors.name?.message}
              />
            )}
          />
        </div>
        <div className="my-4">
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                {...field}
                disabled
                label="Email"
                isRequired
                name="email"
                placeholder="Enter Email"
                error={errors.email?.message}
              />
            )}
          />
        </div>
        <div className="my-4">
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <Input
                {...field}
                label="Address"
                isRequired
                name="address"
                placeholder="Enter Address"
                error={errors.address?.message}
              />
            )}
          />
        </div>
        <div className="my-4">
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input
                {...field}
                label="Phone"
                isRequired
                name="phone"
                placeholder="Enter phone"
                error={errors.phone?.message}
              />
            )}
          />
        </div>

        <div className="my-4">
          <Controller
            control={control}
            name="timezone"
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={TimeZone.map((item) => ({
                  label: item.text,
                  value: item.value
                }))}
                isRequired
                label="Timezone"
                name="timezone"
                placeholder="Select timezone"
                className="border-none px-3 py-2"
              />
            )}
          />
        </div>
        <div className="my-4">
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextArea
                {...field}
                rows={4}
                label="Description"
                isRequired
                name="description"
                placeholder="Enter description"
                error={errors.description?.message}
              />
            )}
          />
        </div>

        <div className="flex w-full justify-end">
          <Button
            className="w-[100px] items-center justify-center text-center"
            type="submit"
            color="bg-primary500"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MainOrganization;