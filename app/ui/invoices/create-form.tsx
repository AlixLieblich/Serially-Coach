'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { lookupSerial } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';

export default function Form() {
  const [result, setResult] = useState<string | null>(null);
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
      const message = await lookupSerial(serial);
      setResult(message);
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
            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          />
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        </div>

        {result && (
          <p className="mt-4 whitespace-pre-line rounded-md bg-white p-3 text-sm text-gray-900">
            {result}
          </p>
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
