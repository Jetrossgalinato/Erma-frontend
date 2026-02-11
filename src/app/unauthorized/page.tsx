"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-500" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Access Denied
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        You do not have permission to access this page.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
