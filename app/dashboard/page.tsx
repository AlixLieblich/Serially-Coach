import SerialLookupForm from '@/app/ui/serial/lookup-form';

export default function Page() {
  return (
    <main>
      <h1 className="mb-2 text-xl font-semibold">Enter your serial number here:</h1>
      <SerialLookupForm />
    </main>
  );
}
