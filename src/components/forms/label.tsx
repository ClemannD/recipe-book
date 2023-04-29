export function Label({
  id,
  label,
  subLabel,
  style,
}: {
  id?: string;
  label: string;
  subLabel?: string;
  style?: any;
}) {
  return (
    <label className="mb-1 block" htmlFor={id} style={style}>
      <p className="font-semibold">{label}</p>
      {subLabel && <p className="text-sm text-gray-500">{subLabel}</p>}
    </label>
  );
}
