import { auth } from '@/auth';
import SerialLookupForm from '@/app/ui/serial/lookup-form';

function parseSerialParam(
  serial: string | string[] | undefined,
): string | undefined {
  const value = Array.isArray(serial) ? serial[0] : serial;
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ serial?: string | string[] }>;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const { serial } = await searchParams;
  const restoreSerial = parseSerialParam(serial);

  return (
    <main>
      <h1 className="mb-2 text-xl font-semibold">Enter your serial number here:</h1>
      <SerialLookupForm
        isLoggedIn={isLoggedIn}
        restoreSerial={restoreSerial}
      />
    </main>
  );
}
