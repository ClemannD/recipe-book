import { cn } from '../../utils/cn';

const Label = ({
  id,
  label,
  subLabel,
  required = false,
  className = '',
}: {
  id?: string;
  label: string;
  subLabel?: string;
  required?: boolean;
  className?: string;
}) => {
  return (
    <label className={cn('mb-1 block', className)} htmlFor={id}>
      <p className="font-semibold">
        {label}
        {required && <sup className="font-normal text-slate-500">*</sup>}
      </p>
      {subLabel && <p className="text-sm text-gray-500">{subLabel}</p>}
    </label>
  );
};

export default Label;
