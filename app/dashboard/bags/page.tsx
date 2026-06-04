import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, getAuthenticatedUserId } from '@/auth';
import { fetchUserBagsWithDetails } from '@/app/lib/user-bags';
import SavedBagForm from '@/app/ui/dashboard/saved-bag-form';
import LookupResultDisplay from '@/app/ui/serial/lookup-result';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export default async function Page() {
  const session = await auth();
  const userId = await getAuthenticatedUserId();

  if (!session?.user || !userId) {
    redirect('/login');
  }

  const bags = await fetchUserBagsWithDetails(userId);

  return (
    <main className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold">My Bags</h1>
      <p className="mb-6 text-sm text-gray-600">
        Saved serial numbers for{' '}
        <span className="font-medium text-gray-900">{session.user.name}</span>
      </p>

      {bags.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-6 text-sm text-gray-600">
          <p>You have not saved any bags yet.</p>
          <Link
            href="/dashboard"
            className="mt-2 inline-block font-medium text-gray-900 underline hover:text-black"
          >
            Look up a serial number
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {bags.map((bag) => (
            <li
              key={`${bag.serial_number}-${bag.created_at}`}
              className="rounded-md border border-gray-200 bg-white p-4 text-sm"
            >
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Serial number
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {bag.serial_number}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  <span className="font-medium text-gray-600">
                    Your color:{' '}
                  </span>
                  {bag.color_name ?? 'Not specified'}
                </p>
                <SavedBagForm
                  serialNumber={bag.serial_number}
                  initialNotes={bag.notes ?? ''}
                  initialBagColorId={bag.bag_color_id}
                  colorOptions={bag.details?.colorOptions ?? []}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Saved {formatDate(bag.created_at)}
                </p>
              </div>

              {bag.details ? (
                <LookupResultDisplay result={bag.details} className="mt-3" />
              ) : (
                <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                  {bag.decodeError ?? 'Could not decode this serial number.'}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
