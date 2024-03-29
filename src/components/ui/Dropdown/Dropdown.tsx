'use client';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

import { useSelectOutsideClick } from './useSelectOutsideClick';

interface IProp {
  mainMenu?: string | React.ReactElement;
  children?: React.ReactNode;
  className?: string;
  classButton?: string;
  isClose?: boolean;
  onClick?: (value: boolean) => void;
}
export default function Dropdown(props: IProp) {
  const { mainMenu, children, className, classButton, isClose, onClick } = props;

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useSelectOutsideClick(dropdownRef, false);

  const onHandleOpen = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    if (onClick) {
      onClick(isActive);
    }
  }, [isActive, onClick]);

  return (
    <div ref={dropdownRef} className="dark:header_cus header_cus_light relative">
      <button
        type="button"
        onClick={onHandleOpen}
        className={clsx(
          classButton,
          'flex w-full items-center rounded-lg text-center text-sm font-medium opacity-90 '
        )}
      >
        {mainMenu}
      </button>
      <div
        onClick={onHandleOpen}
        id="dropdown"
        className={clsx(
          className,
          'dark absolute right-0 z-10 mt-2 origin-top-right rounded-lg bg-paperLight shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-darkGreen',
          { ['hidden']: !isActive, ['block']: isActive }
        )}
      >
        {children}
      </div>
    </div>
  );
}
