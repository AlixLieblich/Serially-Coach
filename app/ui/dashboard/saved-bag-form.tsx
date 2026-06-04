'use client';

import { useActionState } from 'react';
import { updateSavedBag } from '@/app/lib/actions';
import type { StyleColorOption } from '@/app/lib/definitions';
import BagColorSelect from '@/app/ui/bag-color-select';
import { Button } from '@/app/ui/button';

export default function SavedBagForm({
  serialNumber,
  initialNotes,
  initialBagColorId,
  colorOptions,
}: {
  serialNumber: string;
  initialNotes: string;
  initialBagColorId: number | null;
  colorOptions: StyleColorOption[];
}) {
  const [state, formAction, pending] = useActionState(updateSavedBag, undefined);
  const slug = serialNumber.replace(/[^a-zA-Z0-9]/g, '-');

  return (
    <form action={formAction} className="mt-2">
      <input type="hidden" name="serialNumber" value={serialNumber} />

      {colorOptions.length > 0 && (
        <>
          <label
            htmlFor={`bag-color-${slug}`}
            className="mb-1 block text-xs font-medium text-gray-600"
          >
            Your bag&apos;s color
          </label>
          <BagColorSelect
            id={`bag-color-${slug}`}
            name="bagColorId"
            colorOptions={colorOptions}
            defaultValue={initialBagColorId}
          />
        </>
      )}

      <label
        htmlFor={`bag-notes-${slug}`}
        className="mb-1 block text-xs font-medium text-gray-600"
      >
        Notes
      </label>
      <textarea
        id={`bag-notes-${slug}`}
        name="notes"
        rows={2}
        defaultValue={initialNotes}
        placeholder="Add notes about this bag…"
        className="mb-2 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black/50 focus:outline-none focus:ring-1 focus:ring-black/30"
      />
      {state?.error && (
        <p className="mb-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.message && (
        <p className="mb-2 text-sm text-green-800">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} aria-disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
