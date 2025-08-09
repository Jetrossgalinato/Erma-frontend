"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // 👈 For toggle icons

interface Supervisor {
  id: string;
  full_name: string;
}

interface RawSupervisor {
  id: string;
  account_requests: {
    first_name: string | null;
    last_name: string | null;
    is_approved: boolean;
  } | null;
}

export default function InternRegisterForm() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 Toggle state
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 👈 Toggle state
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [internType, setInternType] = useState("");
  const [rfid, setRfid] = useState("");
  const [dutyHours, setDutyHours] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSupervisors = async () => {
      const { data, error } = await supabase.from("supervisor").select(`
        id,
        account_requests:supervisor_account_req_id_fkey (
          first_name,
          last_name,
          is_approved
        )
      `);

      if (error) {
        console.error("Failed to fetch supervisors:", error.message);
        return;
      }

      const mapped = (data as unknown as RawSupervisor[])
        .filter((sup) => sup.account_requests?.is_approved)
        .map((sup) => {
          const first = sup.account_requests?.first_name || "";
          const last = sup.account_requests?.last_name || "";
          return {
            id: sup.id,
            full_name: `${first} ${last}`.trim(),
          };
        });

      setSupervisors(mapped);
    };

    fetchSupervisors();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    const { data: freshUser, error: getUserError } =
      await supabase.auth.getUser();

    if (getUserError || !freshUser?.user) {
      setError("User not fully provisioned yet. Please try again.");
      return;
    }

    const [firstName = "", lastName = ""] = fullName.trim().split(" ", 2);

    const { error: insertError } = await supabase
      .from("account_requests")
      .insert([
        {
          user_id: freshUser.user.id,
          first_name: firstName,
          last_name: lastName,
          student_id: studentId,
          intern_type: internType,
          rfid: rfid,
          total_hours_required: dutyHours,
          supervisor_id: supervisorId,
          is_approved: false,
          is_supervisor: false,
          is_intern: true,
          department: department,
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
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Intern Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
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

        {/* Email */}
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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`mt-1 w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 pr-10 ${
                confirmPassword && confirmPassword !== password
                  ? "border-red-500 focus:ring-red-400"
                  : "text-black focus:ring-orange-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* The rest of your form stays the same */}
        {/* Student ID */}
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

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border text-black bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="" disabled>
              Select Department
            </option>
            <option value="BSIT">BSIT</option>
            <option value="BSIS">BSIS</option>
            <option value="BSCS">BSCS</option>
          </select>
        </div>

        {/* Intern Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Intern Type
          </label>
          <select
            value={internType}
            onChange={(e) => setInternType(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border text-black bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="" disabled>
              Select Intern Type
            </option>
            <option value="OJT">OJT</option>
            <option value="SA">SA</option>
          </select>
        </div>

        {/* RFID */}
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

        {/* Duty Hours */}
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

        {/* Supervisor Select */}
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

        <p className="text-sm text-gray-600 text-center font-bold">
          Already have an account?{" "}
          <a href="/login" className="text-orange-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
