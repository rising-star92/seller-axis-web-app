import { FC } from 'react';
import cx from 'clsx';

import type { GlyphIconType } from '../types';

const Search: FC<GlyphIconType> = ({ className, onClick }) => {
  return (
    <svg
      className={cx('object-contain duration-500', className)}
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.8806 13.8676L18.4868 17.5M16.8201 9.16667C16.8201 12.8486 13.8354 15.8333 10.1535 15.8333C6.47158 15.8333 3.48682 12.8486 3.48682 9.16667C3.48682 5.48477 6.47158 2.5 10.1535 2.5C13.8354 2.5 16.8201 5.48477 16.8201 9.16667Z"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default Search;
