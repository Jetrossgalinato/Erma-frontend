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
    <div className="mb-4 sm:mb-6 md:mb-8">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-base sm:text-lg md:text-xl">
            {formatInitials(firstName, lastName)}
          </span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-1 sm:mb-2">
            {formatFullName(firstName, lastName)}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg">
            {role}
          </p>
          <p className="text-slate-500 text-xs sm:text-sm md:text-base">
            {department}
          </p>
        </div>
      </div>
    </div>
  );
}
