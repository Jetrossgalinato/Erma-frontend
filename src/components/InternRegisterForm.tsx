"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface Supervisor {
  id: string;
  full_name: string;
}

export default function InternRegisterForm() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [internType, setInternType] = useState("");
  const [rfid, setRfid] = useState("");
  const [dutyHours, setDutyHours] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSupervisors = async () => {
      const { data, error } = await supabase
        .from("supervisor")
        .select("id, full_name")
        .eq("is_approved", true);

      if (error) {
        console.error("Failed to fetch supervisors:", error.message);
      } else {
        setSupervisors(data || []);
      }
    };

    fetchSupervisors();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (!user) {
      setError("Signup successful but user data not returned.");
      return;
    }

    const { error: insertError } = await supabase.from("intern").insert([
      {
        user_id: user.id,
        full_name: fullName,
        email: email,
        student_id: studentId,
        intern_type: internType,
        rfid: rfid,
        total_hours_required: dutyHours,
        supervisor_id: supervisorId,
        is_approved: false,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    alert("Registration submitted successfully. Awaiting approval.");
    router.push("/login");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Intern Registration
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
            className="mt-1 w-full px-4 py-2 border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
            className="mt-1 w-full px-4 py-2 border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
            className="mt-1 w-full px-4 py-2 border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Student ID
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Intern Type
          </label>
          <input
            type="text"
            value={internType}
            onChange={(e) => setInternType(e.target.value)}
            placeholder="e.g. OJT, Practicum"
            required
            className="mt-1 w-full px-4 py-2 border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            RFID
          </label>
          <input
            type="text"
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Duty Hours
          </label>
          <input
            type="number"
            value={dutyHours}
            onChange={(e) => setDutyHours(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Supervisor
          </label>
          <select
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border text-black bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">-- Select Supervisor --</option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.full_name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
        >
          Register as Intern
        </button>
      </form>
    </div>
  );
}
