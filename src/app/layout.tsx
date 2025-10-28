import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionTimeoutProvider from "@/components/SessionTimeoutProvider";
import { StoreInitializer } from "@/components/StoreInitializer";
import { AlertProvider } from "@/contexts/AlertContext";

// Load only essential font weights for optimal performance
// Reduced from 18 files to 4 files (77% reduction)
const poppins = localFont({
  src: [
    {
      path: "../../public/fonts/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Poppins-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "swap", // Enable font-display: swap for faster rendering
  preload: true, // Preload fonts for better performance
});

export const metadata: Metadata = {
  title: "CSU - CRMS",
  description: "CSU CCIS Resource Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AlertProvider>
          <StoreInitializer>
            <SessionTimeoutProvider>{children}</SessionTimeoutProvider>
          </StoreInitializer>
        </AlertProvider>
      </body>
    </html>
  );
}
