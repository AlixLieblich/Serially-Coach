import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();
  const user = session?.user;

  const isLoggedIn = !!user;

  return (
    <>
      {isLoggedIn ? (
        <div>
          <p>My bags:</p>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              Logged in as <span className="font-medium">{user?.name}</span>
            </p>
            <p>{user?.email}</p>
          </div>
        </div>
      ) : (
        <p>You are not logged in</p>
      )}
    </>
  );
}