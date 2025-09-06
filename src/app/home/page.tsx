"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session } from "@supabase/supabase-js";

export default function Home() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted) {
        setSession(session);
        setAuthChecked(true);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleGetStarted = () => {
    // Adjust this route if you have a dedicated registration/request-access page
    router.push("/login");
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(to left, #facc76ff, #FDF1AD)" }}
    >
      <Navbar />

      {/* Main Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-10 pl-4">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                Welcome to <span className="text-orange-500">CRIMS</span>
              </h1>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight mt-4">
                CCIS Resource and Internship Management System
              </h1>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-gray-700 max-w-lg leading-relaxed">
                Your one-stop platform for managing college equipment requests
                and tracking your OJT attendance with ease.
              </p>

              {/* Show the button ONLY when:
                  - authChecked is true (so we don't flash the button incorrectly)
                  - user is NOT logged in (session == null)
               */}
              {authChecked && !session && (
                <div>
                  <button
                    onClick={handleGetStarted}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-orange-300"
                    aria-label="Get started with CRIMS"
                  >
                    Get Started
                    <svg
                      className="w-5 h-5"
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
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end items-center">
            {/* Floating Icons */}
            <div className="absolute -top-6 -left-12 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div className="absolute top-12 -left-8 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center transform -rotate-12 shadow-lg">
              <svg
                className="w-10 h-10 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div className="absolute -bottom-4 left-4 w-14 h-14 bg-orange-400 rounded-full flex items-center justify-center transform rotate-45 shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
            </div>

            <div className="absolute bottom-16 -right-6 w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center transform -rotate-12 shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            {/* Phone Mockup */}
            <div className="relative z-10">
              <div className="w-72 h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10"></div>

                  <div className="pt-8 px-6 h-full bg-gray-50">
                    <div className="flex justify-between items-center mb-8 text-sm">
                      <span className="font-semibold text-black">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-black rounded-sm">
                          <div className="w-3 h-1 bg-black rounded-sm"></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="w-full h-24 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          <Image
                            src="/images/projector.png"
                            alt="Projector"
                            width={96}
                            height={96}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-orange-400 h-2 rounded-full"></div>
                        <div className="bg-orange-400 h-2 w-3/4 rounded-full"></div>
                      </div>

                      <div className="relative mt-8">
                        <button className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg">
                          Request
                        </button>

                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                          <svg
                            className="w-8 h-8 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
