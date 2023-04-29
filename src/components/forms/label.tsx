const Label = ({
  id,
  label,
  subLabel,
}: {
  id?: string;
  label: string;
  subLabel?: string;
}) => {
  return (
    <label className="mb-1 block" htmlFor={id}>
      <p className="font-semibold">{label}</p>
      {subLabel && <p className="text-sm text-gray-500">{subLabel}</p>}
    </label>
  );
};

export default Label;
