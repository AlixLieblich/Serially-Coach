'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { lookupSerial } from '@/app/lib/actions';
import type { SerialLookupResult } from '@/app/lib/definitions';
import { Button } from '@/app/ui/button';

function isLookupResult(
  value: SerialLookupResult | string,
): value is SerialLookupResult {
  return typeof value === 'object';
}

function LookupResultDisplay({ result }: { result: SerialLookupResult }) {
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
    <dl className="mt-4 space-y-2 rounded-md bg-white p-3 text-sm text-gray-900">
      {rows.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[9rem_1fr] gap-2">
          <dt className="font-medium text-gray-600">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function SerialLookupForm() {
  const [result, setResult] = useState<SerialLookupResult | string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const serial = String(formData.get('serial') ?? '');

    setPending(true);
    setError(null);
    setResult(null);

    try {
      const response = await lookupSerial(serial);
      if (isLookupResult(response)) {
        setResult(response);
      } else {
        setError(response);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-md">
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <label htmlFor="serial" className="mb-2 block text-sm font-medium">
          Serial number
        </label>
        <div className="relative">
          <input
            id="serial"
            name="serial"
            type="text"
            required
            placeholder="e.g. K8P-9870"
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-500 focus:border-black/50 focus:outline-none focus:ring-1 focus:ring-black/30"
          />
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        </div>

        {result && isLookupResult(result) && (
          <LookupResultDisplay result={result} />
        )}
        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={pending} aria-disabled={pending}>
          {pending ? 'Looking up…' : 'Look up'}
        </Button>
      </div>
    </form>
  );
}
