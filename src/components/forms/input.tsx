import { useField } from 'formik';
import { forwardRef } from 'react';
import Label from './label';
import { cn } from '../../utils/cn';

export type InputProps = {
  textArea?: boolean;
  rows?: number;
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
  className?: string;
  inputClassName?: string;
};

const Input = (
  {
    textArea,
    rows = 3,
    label,
    subLabel,
    errorMessage,
    hideErrorMessage,
    className = '',
    inputClassName = '',
    ...props
  }: InputProps,
  ref: React.Ref<HTMLInputElement | HTMLTextAreaElement>
) => {
  const [field, meta] = useField(props);

  return (
    <div
      className={cn(
        `
            mb-6
            ${hideErrorMessage ? 'mb-0' : ''} 
            ${(meta.touched && meta.error) || errorMessage ? 'mb-2' : ''}
        `,
        className
      )}
    >
      {label && (
        <Label
          label={label}
          subLabel={subLabel}
          id={props.id || props.name}
        ></Label>
      )}
      {textArea ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={cn(
            'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            `h-${rows * 4}`,
            inputClassName
          )}
          rows={rows}
          onClick={(e) => e.stopPropagation()}
          {...field}
          {...props}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            inputClassName
          )}
          onClick={(e) => e.stopPropagation()}
          {...field}
          {...props}
        />
      )}
      {!hideErrorMessage && ((meta.touched && meta.error) || errorMessage) ? (
        <div className="mt-1 text-sm text-red-600">
          {meta.error || errorMessage}
        </div>
      ) : null}
    </div>
  );
};
export default forwardRef(Input);
