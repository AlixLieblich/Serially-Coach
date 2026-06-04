import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, getAuthenticatedUserId } from '@/auth';
import { fetchUserBags } from '@/app/lib/user-bags';

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

  const bags = await fetchUserBags(userId);

  return (
    <main>
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
        <ul className="space-y-4">
          {bags.map((bag) => (
            <li
              key={`${bag.serial_number}-${bag.created_at}`}
              className="rounded-md border border-gray-200 bg-white p-4 text-sm"
            >
              <p className="font-medium text-gray-900">{bag.serial_number}</p>
              {bag.notes && (
                <p className="mt-1 text-gray-700">{bag.notes}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Saved {formatDate(bag.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
