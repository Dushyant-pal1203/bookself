interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-emerald-500 text-cyan-800", // ✅ ADD THIS LINE
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  published: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const color =
    statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
