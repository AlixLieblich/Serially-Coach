'use client';

import { useActionState } from 'react';
import { saveUserBag } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';

export default function SaveBagForm({ serialNumber }: { serialNumber: string }) {
  const [state, formAction, pending] = useActionState(saveUserBag, undefined);

  return (
    <form action={formAction} className="mt-4 border-t border-gray-200 pt-4">
      <input type="hidden" name="serialNumber" value={serialNumber} />
      <p className="mb-2 text-sm font-medium text-gray-900">Save this bag</p>
      <label htmlFor="notes" className="mb-1 block text-xs font-medium text-gray-600">
        Notes (optional)
      </label>
      <textarea
        id="notes"
        name="notes"
        rows={2}
        placeholder="e.g. gift from mom, great condition"
        className="mb-3 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-500 focus:border-black/50 focus:outline-none focus:ring-1 focus:ring-black/30"
      />
      {state?.error && (
        <p className="mb-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.message && (
        <p className="mb-2 text-sm text-green-800">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} aria-disabled={pending}>
        {pending ? 'Saving…' : 'Save to My Bags'}
      </Button>
    </form>
  );
}
