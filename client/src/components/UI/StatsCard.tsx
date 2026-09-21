// client/src/components/UI/StatsCard.tsx
import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  description?: string;
}

export const StatsCard = ({
  title,
  value,
  icon,
  trend,
  onClick,
  description,
}: StatsCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm p-6 border border-gray-100
        ${onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95" : ""}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-2">{description}</p>
        )}
      </div>
    </div>
  );
};
