import { formatInitials, formatFullName } from "../utils/helpers";

interface ProfileHeaderProps {
  firstName?: string;
  lastName?: string;
  role?: string;
  department?: string;
}

export default function ProfileHeader({
  firstName,
  lastName,
  role,
  department,
}: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">
            {formatInitials(firstName, lastName)}
          </span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            {formatFullName(firstName, lastName)}
          </h1>
          <p className="text-slate-600 text-lg">{role}</p>
          <p className="text-slate-500">{department}</p>
        </div>
      </div>
    </div>
  );
}
