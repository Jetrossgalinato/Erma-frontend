"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function SupervisorRegisterForm() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (!user) {
      setError("Signup successful but user data not returned.");
      return;
    }

    // 👇 Split fullName into first and last names
    const [firstName = "", lastName = ""] = fullName.trim().split(" ");

    // ✅ Only insert into account_requests (wait for approval before inserting to supervisor table)
    const { error: requestError } = await supabase
      .from("account_requests")
      .insert([
        {
          user_id: user.id,
          is_supervisor: true,
          is_intern: false,
          first_name: firstName,
          last_name: lastName,
          department: department,
          acc_role: position,
        },
      ]);

    if (requestError) {
      setError(requestError.message);
      return;
    }

    alert("Registration submitted successfully. Awaiting approval.");
    router.push("/login");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Supervisor Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
        >
          Register as Supervisor
        </button>
      </form>
    </div>
  );
}
