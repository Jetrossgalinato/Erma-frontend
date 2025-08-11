// components/StatCards.tsx
"use client";
import { FC } from "react";

interface StatCardProps {
  title: string;
  value: number | null;
  bgColor: string;
  iconPath: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, bgColor, iconPath }) => {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={`w-8 h-8 ${bgColor} rounded-md flex items-center justify-center`}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={iconPath}
                />
              </svg>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-semibold text-gray-900">
                {value !== null ? value : "Loading..."}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardsGridProps {
  stats: StatCardProps[];
}

export const StatCardsGrid: FC<StatCardsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat, idx) => (
        <StatCard key={idx} {...stat} />
      ))}
    </div>
  );
};
