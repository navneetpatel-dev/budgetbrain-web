import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text p-xl text-center">
      <h1 className="text-4xl font-extrabold text-primary mb-md">404</h1>
      <h2 className="text-xl font-bold mb-sm">Page Not Found</h2>
      <p className="text-text-secondary max-w-md mb-xl">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-lg py-sm rounded-lg bg-primary text-white font-semibold shadow-md hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  );
}
