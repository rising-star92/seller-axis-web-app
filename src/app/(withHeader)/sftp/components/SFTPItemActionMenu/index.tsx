import IconAction from 'public/three-dots.svg';

import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import DetailIcon from 'public/detail.svg';
import DeleteIcon from 'public/delete.svg';
import DownloadIcon from 'public/download.svg';
import type { SFTP } from '../../interface';

export type ActionProps = {
  row: SFTP;
  onViewDetailItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
  onDownloadOrder: (id: number) => void;
};

export const SFTPItemActionMenu = ({
  row,
  onDeleteItem,
  onViewDetailItem,
  onDownloadOrder
}: ActionProps) => {
  const onDelete = (value: number) => () => {
    onDeleteItem(value);
  };

  const onViewDetail = (value: number) => () => {
    onViewDetailItem(value);
  };

  return (
    <Dropdown mainMenu={<IconAction />} className="w-[150px]">
      <div className="z-50 rounded-lg ">
        <Button onClick={() => onDownloadOrder(+row.retailer)} startIcon={<DownloadIcon />}>
          Download
        </Button>
        <Button onClick={onViewDetail(+row.id)} startIcon={<DetailIcon />}>
          Detail
        </Button>
        <Button onClick={onDelete(+row.id)} startIcon={<DeleteIcon />}>
          Delete
        </Button>
      </div>
    </Dropdown>
  );
};
