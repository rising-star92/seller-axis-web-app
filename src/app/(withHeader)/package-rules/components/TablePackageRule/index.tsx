import dayjs from 'dayjs';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Table } from '@/components/ui/Table';
import { PackageRuleType } from '../../interface';
import { useMemo } from 'react';
import { PackageRuleItemActionMenu } from '../PackageRuleItemActionMenu';
import IconAction from 'public/three-dots.svg';
import IconDelete from 'public/delete.svg';

type TablePackageRuleProps = {
  headerTable: {
    id: string;
    label: string;
  }[];
  selectedItems: number[];
  onSelectAll: () => void;
  onSelectItem: (id: number) => void;
  totalCount: number;
  onPageChange: (value: string | number) => void;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  packageRules: PackageRuleType;
  onViewDetailItem: (id: number) => void;
  onDeleteItem: (id: number) => Promise<void>;
};

export const TablePackageRule = (props: TablePackageRuleProps) => {
  const {
    headerTable,
    selectedItems,
    onSelectAll,
    onSelectItem,
    totalCount,
    onPageChange,
    page,
    rowsPerPage,
    loading,
    packageRules,
    onViewDetailItem,
    onDeleteItem
  } = props;

  const renderBodyTable = useMemo(() => {
    return packageRules?.results?.map((item) => ({
      id: item.id || '',
      name: item.name || '-',
      length: item.length || '-',
      wight: item.wight || '-',
      height: item.height || '-',
      dimension_unit: item.dimension_unit || '-',
      created_at: dayjs(item.created_at).format('YYYY-MM-DD') || '-',
      action: (
        <div className="flex items-center justify-center">
          <div className="absolute">
            <PackageRuleItemActionMenu
              row={item}
              onViewDetailItem={onViewDetailItem}
              onDeleteItem={onDeleteItem}
            />
          </div>
        </div>
      )
    }));
  }, [onDeleteItem, onViewDetailItem, packageRules?.results]);

  return (
    <Table
      columns={headerTable}
      loading={loading}
      rows={renderBodyTable}
      isPagination
      isSelect={true}
      selectedItems={selectedItems}
      selectAllTable={onSelectAll}
      selectItemTable={onSelectItem}
      totalCount={totalCount}
      siblingCount={1}
      onPageChange={onPageChange}
      currentPage={page}
      pageSize={rowsPerPage}
      selectAction={
        <Dropdown className="left-0 w-[160px] dark:bg-gunmetal" mainMenu={<IconAction />}>
          <div className="rounded-lg ">
            <Button>
              <IconDelete />
              Delete
            </Button>
          </div>
        </Dropdown>
      }
    />
  );
};