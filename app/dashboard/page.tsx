import { auth } from '@/auth';
import SerialLookupForm from '@/app/ui/serial/lookup-form';

export default async function Page() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <main>
      <h1 className="mb-2 text-xl font-semibold">Enter your serial number here:</h1>
      <SerialLookupForm isLoggedIn={isLoggedIn} />
    </main>
  );
}
