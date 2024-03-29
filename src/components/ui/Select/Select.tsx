import clsx from 'clsx';
import { forwardRef } from 'react';

interface Select extends React.SelectHTMLAttributes<{}> {
  className?: string;
  label?: string;
  error?: string;
  options: any[];
}
const Select = forwardRef(function Select({ className, error, label, options, ...rest }: Select) {
  return (
    <>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {rest.required && <span className="pl-1 text-sm text-red">*</span>}
      </label>
      <select
        {...rest}
        className={clsx(
          'block h-8 w-full rounded-md border-none bg-neutralLight text-sm text-black dark:bg-gunmetal dark:text-white',
          className
        )}
      >
        <option hidden value="default">
          {rest?.value ? rest?.value : 'Select'}
        </option>
        {options.map((item) => (
          <option
            className="bg-neutralLight text-black dark:bg-gunmetal dark:text-white"
            key={item?.label}
            value={item.value}
          >
            {item.label || item}
          </option>
        ))}
      </select>

      {error && <p className="mb-2 block text-sm font-medium text-red">{error}</p>}
    </>
  );
});

export default Select;
