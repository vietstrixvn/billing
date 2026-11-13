'use client';

import Link from 'next/link';

export default function AdminNotFound() {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-main">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            Page not found
          </h2>
          <p className="text-gray-600">
            The page you are looking for either doesn't exist or has been
            deleted.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/admin"
            className="px-6 py-2.5 bg-main text-white rounded-lg hover:bg-primary-700 transition-colors font-medium inline-block"
          >
            Back to Admin
          </Link>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
