"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function NotFoundContent() {
  const searchParams = useSearchParams();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="mb-6">Sorry, the page you are looking for doesn't exist.</p>
      <a
        href="/"
        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
      >
        Go Home
      </a>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      }
    >
      <NotFoundContent />
    </Suspense>
  );
}
