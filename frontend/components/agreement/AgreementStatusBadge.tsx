import { AgreementStatus } from "@/types/agreement";
import { getStatusLabel, getStatusColorClasses } from "@/lib/agreement/state-machine";

interface AgreementStatusBadgeProps {
  status: AgreementStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AgreementStatusBadge({
  status,
  showLabel = true,
  size = "md"
}: AgreementStatusBadgeProps) {
  const label = getStatusLabel(status);
  const colorClasses = getStatusColorClasses(status);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${colorClasses} ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {showLabel && label}
    </span>
  );
}
