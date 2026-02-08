import dynamic from "next/dynamic";
import Image from "next/image";
import HeroActions from "./HeroActions";

const Navbar = dynamic(() => import("../../components/Navbar"), { ssr: true });
const Footer = dynamic(() => import("../../components/Footer"), { ssr: true });

export default function Home() {
  // const { isAuthenticated, isLoading } = useAuthStore(); // Moved to HeroActions

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(to left, #facc76ff, #FDF1AD)" }}
    >
      <Navbar />

      {/* Main Hero Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-8 py-4 w-full">
          {/* Reduced py-8 to py-4 for less space above and below */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Reduced gap-16 to gap-12 for less vertical space */}
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-3 md:space-y-4">
                <h1 className="text-3xl md:text-5xl lg:text-5xl font-semibold text-gray-800 leading-tight">
                  Welcome to <span className="text-orange-500">ERMA v2</span>
                </h1>
                <h2 className="text-lg md:text-2xl lg:text-2xl font-medium text-gray-700 leading-snug">
                  Equipment and Resource Management Application v2
                </h2>
              </div>

              <div className="space-y-5 md:space-y-6">
                <p className="text-base md:text-lg text-gray-700 max-w-xl leading-relaxed">
                  Your one-stop platform for managing college equipment,
                  facility and supply requests with ease.
                </p>

                <HeroActions />
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="relative justify-center lg:justify-end items-center hidden md:flex">
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
                          <svg
                            className="w-5 h-5 text-black"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7H5a2 2 0 00-2 2v6a2 2 0 002 2h11a2 2 0 002-2V9a2 2 0 00-2-2zM18 10h2v4h-2"
                            />
                            <path
                              stroke="none"
                              fill="currentColor"
                              d="M6 9h9a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1v-4a1 1 0 011-1z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="w-full h-24 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            <Image
                              src="/images/projector.png"
                              alt="Projector"
                              width={80}
                              height={80}
                              className="object-contain h-auto"
                              style={{ height: "auto", width: "auto" }}
                              priority
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
      </div>

      <Footer />
    </div>
  );
}
