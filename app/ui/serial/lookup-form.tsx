'use client';

import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { lookupSerial } from '@/app/lib/actions';
import type { SerialLookupResult } from '@/app/lib/definitions';
import { Button } from '@/app/ui/button';
import LookupResultDisplay from '@/app/ui/serial/lookup-result';
import AuthSavePrompt from '@/app/ui/serial/auth-save-prompt';
import SaveBagForm from '@/app/ui/serial/save-bag-form';

function isLookupResult(
  value: SerialLookupResult | string,
): value is SerialLookupResult {
  return typeof value === 'object';
}

type SerialLookupFormProps = {
  isLoggedIn: boolean;
  restoreSerial?: string;
};

export default function SerialLookupForm({
  isLoggedIn,
  restoreSerial,
}: SerialLookupFormProps) {
  const [serialInput, setSerialInput] = useState(restoreSerial ?? '');
  const [result, setResult] = useState<SerialLookupResult | string | null>(
    null,
  );
  const [lastSerial, setLastSerial] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const hasRestoredRef = useRef(false);

  async function runLookup(serial: string) {
    setPending(true);
    setError(null);
    setResult(null);
    setLastSerial(null);

    try {
      const response = await lookupSerial(serial);
      if (isLookupResult(response)) {
        setResult(response);
        setLastSerial(serial);
      } else {
        setError(response);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (!restoreSerial || hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    setSerialInput(restoreSerial);
    void runLookup(restoreSerial);
  }, [restoreSerial]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const serial = serialInput.trim();
    if (!serial) return;
    await runLookup(serial);
  }

  return (
    <div className="mt-4 max-w-md">
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <form onSubmit={handleSubmit}>
          <label htmlFor="serial" className="mb-2 block text-sm font-medium">
            Serial number
          </label>
          <div className="relative">
            <input
              id="serial"
              name="serial"
              type="text"
              required
              value={serialInput}
              onChange={(event) => setSerialInput(event.target.value)}
              placeholder="e.g. K8P-9870"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm placeholder:text-gray-500 focus:border-black/50 focus:outline-none focus:ring-1 focus:ring-black/30"
            />
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>

          <div className="mt-6">
            <Button type="submit" disabled={pending} aria-disabled={pending}>
              {pending ? 'Looking up…' : 'Look up'}
            </Button>
          </div>
        </form>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {result && isLookupResult(result) && (
          <>
            <LookupResultDisplay result={result} className="mt-4 bg-white" />
            {lastSerial &&
              (isLoggedIn ? (
                <SaveBagForm
                  serialNumber={lastSerial}
                  colorOptions={result.colorOptions}
                />
              ) : (
                <AuthSavePrompt serialNumber={lastSerial} />
              ))}
          </>
        )}
      </div>
    </div>
  );
}
