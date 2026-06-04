import type { SerialLookupResult } from '@/app/lib/definitions';
import clsx from 'clsx';

export default function LookupResultDisplay({
  result,
  className,
}: {
  result: SerialLookupResult;
  className?: string;
}) {
  const rows: { label: string; value: string }[] = [
    { label: 'Month', value: result.month },
    { label: 'Year', value: result.year },
    { label: 'Style', value: result.style },
    { label: 'Category', value: result.category },
    { label: 'Production start', value: result.productionStart },
    { label: 'Production end', value: result.productionEnd },
    {
      label: 'Colors',
      value:
        result.colors.length > 0 ? result.colors.join(', ') : 'Unknown',
    },
  ];

  return (
    <dl
      className={clsx(
        'space-y-2 rounded-md bg-gray-50 p-3 text-sm text-gray-900',
        className,
      )}
    >
      {rows.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[9rem_1fr] gap-2">
          <dt className="font-medium text-gray-600">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
