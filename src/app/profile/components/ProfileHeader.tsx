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
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm sm:text-base md:text-lg">
            {formatInitials(firstName, lastName)}
          </span>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800">
            {formatFullName(firstName, lastName)}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base">
            {role}
          </p>
          <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm">
            {department}
          </p>
        </div>
      </div>
    </div>
  );
}
