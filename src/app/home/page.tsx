"use client";
import Navbar from "../../components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(to right, #FEDD9E, #FDF1AD)" }}
    >
      <Navbar />

      {/* Main Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                Welcome
              </h1>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                to <span className="text-orange-500">CRIMS</span>
              </h1>
              <h1 className="text-3xl lg:text-4xl font-bold text-orange-500 leading-tight">
                CCIS RESOURCE AND INTERNSHIP MANAGEMENT SYSTEM
              </h1>
            </div>

            <p className="text-lg text-gray-700 max-w-md">
              Your one-stop platform for managing college equipment requests and
              tracking your OJT attendance with ease.
            </p>

            <button className="bg-orange-500 hover:bg-orange-600 cursor-pointer hover:shadow-lg text-white px-8 py-4 rounded-lg font-semibold text-lg transition duration-300 flex items-center gap-2">
              Get started
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Floating Icons */}
            <div className="absolute -top-4 -left-8 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
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

            <div className="absolute top-16 -left-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center transform -rotate-12 shadow-lg">
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

            <div className="absolute -bottom-8 left-8 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center transform rotate-45 shadow-lg">
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

            {/* Phone Mockup */}
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-72 h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10"></div>

                  {/* Phone Content */}
                  <div className="pt-8 px-6 h-full bg-gray-50">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-8 text-sm">
                      <span className="font-semibold text-black">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-black rounded-sm">
                          <div className="w-3 h-1 bg-black rounded-sm"></div>
                        </div>
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="space-y-6">
                      {/* Projector Image */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
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

                      {/* Progress Bar */}
                      <div className="bg-orange-400 h-2 rounded-full"></div>
                      <div className="bg-orange-400 h-2 w-25 rounded-full"></div>

                      {/* Request Button */}
                      <div className="relative">
                        <button className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg">
                          Request
                        </button>

                        {/* Floating Icon */}
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

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            College of Computing and Information Sciences (CCIS)
          </h3>
          <p className="text-slate-300 mb-4">
            Caraga State University - Ampayon, Butuan City, Caraga Region, 8600
            Philippines
          </p>
          <p className="text-slate-400 text-sm mb-4">
            © 2025 CCIS ERMA. All rights reserved.
          </p>

          {/* Social Media Icons */}
          <div className="flex justify-center items-center gap-4">
            {/* Facebook Icon */}
            <a
              href="#"
              className="text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* GitHub Icon */}
            <a
              href="#"
              className="text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
