import dayjs from 'dayjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Table } from '@/components/ui/Table';
import type { ListSFTP } from '../../interface';
import { SFTPItemActionMenu } from '../SFTPItemActionMenu';

type TableSFTPProps = {
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
  loading: boolean;
  dataProduct: ListSFTP;
  onViewDetailItem: (id: number) => void;
  onDeleteItem: (id: number) => Promise<void>;
  onDownloadOrder: (id: number) => Promise<void>;
};

export const TableSFTP = (props: TableSFTPProps) => {
  const router = useRouter();

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
    dataProduct,
    onViewDetailItem,
    onDeleteItem,
    onDownloadOrder
  } = props;

  const renderBodyTable = dataProduct.results?.map((row) => ({
    id: row.id || '',
    sftp_host: row.sftp_host || '',
    sftp_username: row.sftp_username || '',
    retailer: row.retailer || '',
    created_at: dayjs(row.created_at).format('YYYY-MM-DD') || '',
    action: (
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex items-center justify-center"
      >
        <div className="absolute">
          <SFTPItemActionMenu
            row={row}
            onViewDetailItem={onViewDetailItem}
            onDeleteItem={onDeleteItem}
            onDownloadOrder={onDownloadOrder}
          />
        </div>
      </div>
    )
  }));

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
      onClickItem={(id) => router.push(`/sftp/${id}`)}
      selectAction={
        <Dropdown
          className="left-0 w-[160px] dark:bg-gunmetal"
          mainMenu={
            <Image src="/three-dot.svg" width={20} height={20} alt="Picture of the author" />
          }
        >
          <div className="rounded-lg ">
            <Button>
              <Image src="/delete.svg" width={13} height={13} alt="Picture of the author" />
              Delete
            </Button>
          </div>
        </Dropdown>
      }
    />
  );
};