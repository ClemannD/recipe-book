import { cn } from '../../utils/cn';

const Label = ({
  id,
  label,
  subLabel,
  className = '',
}: {
  id?: string;
  label: string;
  subLabel?: string;
  className?: string;
}) => {
  return (
    <label className={cn('mb-1 block', className)} htmlFor={id}>
      <p className="font-semibold">{label}</p>
      {subLabel && <p className="text-sm text-gray-500">{subLabel}</p>}
    </label>
  );
};

export default Label;
