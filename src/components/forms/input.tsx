import { useField } from 'formik';
import { forwardRef, useEffect } from 'react';
import { Label } from './label';

export type InputProps = {
  label?: string;
  subLabel?: string;
  id?: string;
  name: string;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  errorMessage?: string;
  hideErrorMessage?: boolean;
  autoFocus?: boolean;
  max?: number;
  min?: number;
  style?: React.CSSProperties;
};

export const Input = forwardRef(
  (
    {
      label,
      subLabel,
      errorMessage,
      hideErrorMessage,
      style,
      ...props
    }: InputProps,
    ref: React.Ref<HTMLInputElement>
  ) => {
    const [field, meta] = useField(props);

    return (
      <div
        className={`
            mb-6
            ${hideErrorMessage ? 'mb-0' : ''} 
            ${(meta.touched && meta.error) || errorMessage ? 'mb-2' : ''}
        `}
      >
        {label && (
          <Label
            label={label}
            subLabel={subLabel}
            id={props.id || props.name}
          ></Label>
        )}
        <input
          ref={ref}
          className={`
            h-10
            w-full
            rounded-sm
            border
            border-gray-300
            px-3
            py-0
            text-base
            focus:border-sky-600
            focus:outline-none
            ${
              (meta.touched && meta.error) || errorMessage
                ? 'border-red-600'
                : ''
            }
            disabled:cursor-not-allowed
            disabled:bg-gray-400
        `}
          {...field}
          {...props}
        />
        {!hideErrorMessage && ((meta.touched && meta.error) || errorMessage) ? (
          <div className="mt-1 text-sm text-red-600">
            {meta.error || errorMessage}
          </div>
        ) : null}
      </div>
    );
  }
);
