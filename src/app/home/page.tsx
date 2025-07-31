"use client";
import Navbar from "../../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center text-black text-2xl font-bold mt-10">
        <h1>This is the home page</h1>
      </div>
    </div>
  );
}
