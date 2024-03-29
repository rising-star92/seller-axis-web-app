'use client';
import clsx from 'clsx';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { SubBar } from '@/components/common/SubBar';
import Autocomplete from '@/components/ui/Autocomplete';
import { Button } from '@/components/ui/Button';
import DateRangePicker from '@/components/ui/DateRangePicker';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import usePagination from '@/hooks/usePagination';
import { filterStatusDailyPickList } from '../../orders/constants';
import { Options } from '../../orders/containers';
import TableDailyPickList from '../components/TableDailyPickList';
import { useStoreDailyPickList } from '../context';
import {
  getDailyPickListFailure,
  getDailyPickListRequest,
  getDailyPickListSuccess
} from '../context/action';
import { getDailyPickListService } from '../fetch';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function DailyPickListContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const created_at = searchParams.get('created_at');
  const {
    state: { isLoading, dataDailyPickList },
    dispatch: DailyPickListDispatch
  } = useStoreDailyPickList();

  const groupNames = [
    ...(new Set(
      dataDailyPickList?.flatMap((item) => item?.group?.map((group) => group?.name))
    ) as never)
  ];

  const { page, rowsPerPage, onPageChange, onChangePerPage, setCurrentPage } = usePagination();

  const [dateRange, setDateRange] = useState({
    startDate: created_at
      ? dayjs(created_at).format('YYYY-MM-DD')
      : dayjs().tz('America/New_York').format('YYYY-MM-DD'),
    endDate: null
  });
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [activeButtonDate, setActiveButtonDate] = useState<string | null>(
    created_at
      ? dayjs(created_at).format('YYYY-MM-DD')
      : dayjs().tz('America/New_York').format('YYYY-MM-DD')
  );

  const [filter, setFilter] = useState<{
    status: Options[];
  }>({
    status: [
      {
        label: 'Shipped',
        value: 'Shipped'
      },
      {
        label: 'Shipment Confirmed',
        value: 'Shipment Confirmed'
      },
      {
        label: 'Invoiced',
        value: 'Invoiced'
      },
      {
        label: 'Invoice Confirmed',
        value: 'Invoice Confirmed'
      },
      {
        label: 'Acknowledged',
        value: 'Acknowledged'
      }
    ]
  });

  const handleClose = () => setDropdownVisible(false);

  useOnClickOutside(dropdownRef, handleClose);

  const handleGetDailyPickList = useCallback(async () => {
    try {
      DailyPickListDispatch(getDailyPickListRequest());
      const res = await getDailyPickListService({
        page,
        rowsPerPage,
        created_at: activeButtonDate || dayjs().tz('America/New_York').format(),
        status: filter?.status.map((item) => item.value).toString() || ''
      });
      DailyPickListDispatch(getDailyPickListSuccess(res));
      params.set(
        'created_at',
        dayjs(activeButtonDate).format('MM-DD-YYYY') ||
          dayjs().tz('America/New_York').format('MM-DD-YYYY')
      );
      router.push(`${pathname}?${params.toString()}`);
    } catch (error: any) {
      DailyPickListDispatch(getDailyPickListFailure(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DailyPickListDispatch, activeButtonDate, page, rowsPerPage]);

  const handleButtonClick = async (clickedDate: string) => {
    setActiveButtonDate(clickedDate);
    params.set(
      'created_at',
      dayjs(clickedDate).format('MM-DD-YYYY') || dayjs().tz('America/New_York').format('MM-DD-YYYY')
    );
    router.push(`${pathname}?${params.toString()}`);
  };

  const generateDateButtons = () => {
    if (dateRange.startDate && dateRange.endDate) {
      const start = dayjs.tz(dateRange.startDate, 'America/New_York');
      const end = dayjs.tz(dateRange.endDate, 'America/New_York');
      const today = dayjs().tz('America/New_York');

      const dayCount = Math.max(end.diff(start, 'day') + 1, 1);

      return Array.from({ length: dayCount }, (_, index) => {
        const date = start.add(index, 'day');
        const label = date.isSame(today, 'day') ? 'Today' : date.format('D');
        const month = date.isSame(today, 'day') ? '' : date.format('MMM').toUpperCase();

        return (
          <button
            key={date.toISOString()}
            className={clsx(
              'mr-2 flex w-[70px] flex-col items-center justify-center rounded px-[8px] py-[6px]',
              {
                'border border-lightLine bg-buttonLight dark:border-iridium dark:bg-gunmetal':
                  activeButtonDate === date.format('YYYY-MM-DD')
              }
            )}
            onClick={() => handleButtonClick(date.format('YYYY-MM-DD'))}
          >
            <p>{month}</p>
            <p className="text-lg font-bold">{label}</p>
          </button>
        );
      });
    } else if (created_at && created_at !== dayjs().tz('America/New_York').format('MM-DD-YYYY')) {
      const date = dayjs(created_at).format('D');
      const month = dayjs(created_at).format('MMM').toUpperCase();
      return (
        <button className="mr-4 flex flex-col items-center justify-center rounded border border-lightLine bg-buttonLight px-[8px] py-[6px] dark:border-iridium dark:bg-gunmetal">
          <p>{month}</p>
          <p className="text-lg font-bold">{date}</p>
        </button>
      );
    } else {
      const label = 'Today';
      const month = '';
      const today = dayjs().tz('America/New_York');

      return (
        <button
          key={today.toISOString()}
          className="mr-4 flex flex-col items-center justify-center rounded border border-lightLine bg-buttonLight px-[8px] py-[6px] dark:border-iridium dark:bg-gunmetal"
        >
          <p>{month}</p>
          <p className="text-lg font-bold">{label}</p>
        </button>
      );
    }
  };

  const handleClearDay = () => {
    setActiveButtonDate(dayjs().tz('America/New_York').format('YYYY-MM-DD'));
    handleGetDailyPickList();
    !generateDateButtons();
    setDateRange({
      startDate: dayjs().tz('America/New_York').format('YYYY-MM-DD'),
      endDate: null
    });
    params.delete('created_at');
    router.push(`${pathname}?${params}`);
  };

  useEffect(() => {
    handleGetDailyPickList();
  }, [handleGetDailyPickList]);

  const handleChangeFilter = (name: string, value: Options) => {
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const handleClearFilter = async () => {
    setFilter({
      status: []
    });
    try {
      DailyPickListDispatch(getDailyPickListRequest());
      const res = await getDailyPickListService({
        page,
        rowsPerPage,
        created_at: activeButtonDate || dayjs().tz('America/New_York').format(),
        status: ''
      });
      DailyPickListDispatch(getDailyPickListSuccess(res));
    } catch (error: any) {
      DailyPickListDispatch(getDailyPickListFailure(error));
    }
  };

  const handleFilter = async () => {
    try {
      DailyPickListDispatch(getDailyPickListRequest());
      const res = await getDailyPickListService({
        page,
        rowsPerPage,
        created_at: activeButtonDate || dayjs().tz('America/New_York').format(),
        status: filter?.status.map((item) => item.value).toString() || ''
      });
      DailyPickListDispatch(getDailyPickListSuccess(res));
    } catch (error: any) {
      DailyPickListDispatch(getDailyPickListFailure(error));
    }
  };

  return (
    <main className="flex h-full flex-col">
      <div className="flex h-full flex-col gap-[18px]">
        <SubBar
          setCurrentPage={setCurrentPage}
          title={'Daily Pick List'}
          isSearch={false}
          isActiveFilter
          filterContent={
            <div className="grid gap-2">
              <Autocomplete
                options={filterStatusDailyPickList}
                addNew={false}
                multiple
                label="Status"
                name="status"
                placeholder="Select Status"
                value={filter.status}
                onChange={(value: Options) => handleChangeFilter('status', value)}
              />

              <div className="mt-2 grid w-full grid-cols-2 gap-2">
                <Button
                  onClick={handleClearFilter}
                  color="dark:bg-gunmetal bg-buttonLight"
                  className="flex justify-center"
                >
                  Clear
                </Button>
                <Button
                  disabled={isLoading}
                  isLoading={isLoading}
                  onClick={handleFilter}
                  className="flex justify-center bg-dodgerBlue text-white"
                >
                  Apply
                </Button>
              </div>
            </div>
          }
          otherAction={
            <div className="flex items-center space-x-4">
              <DateRangePicker
                dropdownRef={dropdownRef}
                dateRange={dateRange}
                setDateRange={setDateRange}
                dropdownVisible={dropdownVisible}
                setDropdownVisible={setDropdownVisible}
              />
              <Button
                color="dark:bg-gunmetal bg-buttonLight"
                className="flex items-center py-2"
                onClick={handleClearDay}
                disabled={!dateRange.endDate}
              >
                Clear
              </Button>
            </div>
          }
        />
        {generateDateButtons() && (
          <div className="flex max-h-[200px] flex-wrap overflow-y-auto">
            {generateDateButtons()}
          </div>
        )}
        <div className="h-full">
          <TableDailyPickList
            onChangePerPage={onChangePerPage}
            dataDailyPickList={dataDailyPickList}
            groupNames={groupNames as []}
            isLoading={isLoading}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </main>
  );
}
