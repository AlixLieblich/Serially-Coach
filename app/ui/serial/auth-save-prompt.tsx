import Link from 'next/link';
import { encodeDashboardCallback } from '@/app/lib/dashboard-callback';
import { Button } from '@/app/ui/button';

export default function AuthSavePrompt({
  serialNumber,
}: {
  serialNumber: string;
}) {
  const callbackUrl = encodeDashboardCallback(serialNumber);
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <p className="mb-2 text-sm font-medium text-gray-900">Would you like to save this bag? </p>
      <p className="mb-3 text-sm text-gray-600">
        Sign in or create an account to add this bag to My Bags.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Link href={`/login?callbackUrl=${callbackUrl}`}>
          <Button type="button" className="w-full sm:w-auto">
            Sign in
          </Button>
        </Link>
        <Link href={`/register?callbackUrl=${callbackUrl}`}>
          <Button
            type="button"
            className="w-full bg-gray-800 text-white hover:bg-gray-900 sm:w-auto"
          >
            Create an account
          </Button>
        </Link>
      </div>
    </div>
  );
}
