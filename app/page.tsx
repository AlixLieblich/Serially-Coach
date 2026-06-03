import SeriallyCoachLogo from '@/app/ui/serially-coach-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
import { auth, signOut } from '@/auth';

export default async function Page() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-black/70 p-4 md:h-52">
        <SeriallyCoachLogo />
      </div>

      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <p
            className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}
          >
            <strong>Welcome to Serially Coach! </strong>
            <span>Where Coach lovers can find out more about their favorite bags.</span>
          </p>

          <Link
            href="/dashboard"
            className="flex items-center gap-5 self-start rounded-lg bg-black/70 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black md:text-base"
          >
            <span>Uncover Your Bag</span>
            <ArrowRightIcon className="w-5 md:w-6" />
          </Link>

          {isLoggedIn ? (
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/bags"
                className="flex items-center gap-5 self-start rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black md:text-base"
              >
                <span>View Your Bags</span>
                <ArrowRightIcon className="w-5 md:w-6" />
              </Link>

              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-5 self-start rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 md:text-base"
                >
                  <span>Sign out</span>
                  <ArrowRightIcon className="w-5 md:w-6" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-5 self-start rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 md:text-base"
            >
              <span>Log in</span>
              <ArrowRightIcon className="w-5 md:w-6" />
            </Link>
          )}
        </div>

        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <Image
            src="/vintagelandingpagephoto.jpg"
            width={3000}
            height={1000}
            className="hidden md:block"
            alt="Landing page image"
          />

          <p className="mt-2 text-center text-sm italic text-gray-500">
            Photo by Krystyna Spark.
          </p>
        </div>
      </div>
    </main>
  );
}