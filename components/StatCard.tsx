import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({
  icon: Icon, label, value, sublabel, tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  tone?: "neutral" | "save" | "warn";
}) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700",
    save: "bg-brand-50 text-brand-700",
    warn: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-500">{label}</span>
        <span className={cn("w-8 h-8 grid place-items-center rounded-lg", tones[tone])}>
          <Icon size={16} />
        </span>
      </div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      {sublabel && <div className="text-xs text-ink-500">{sublabel}</div>}
    </div>
  );
}
