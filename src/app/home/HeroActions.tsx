"use client";

import Link from "next/link";
import { useAuthStore } from "@/store";

export default function HeroActions() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-14 w-40 bg-gray-200 animate-pulse rounded-xl"></div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <Link href="/login">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 md:px-8 md:py-4 cursor-pointer rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-base md:text-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-orange-300"
            aria-label="Get started with CRIMS"
          >
            Get Started
            <svg
              className="w-3 h-3 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/equipment">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 md:px-8 md:py-4 cursor-pointer rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-base md:text-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-orange-300"
          aria-label="Go to My requests"
        >
          Make a Request
          <svg
            className="w-3 h-3 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </Link>
    </div>
  );
}
