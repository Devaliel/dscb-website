import type { Tier } from "@/lib/utils";
import { TIER_COLOR } from "@/lib/utils";

export default function TierBadge({
  tier,
  size = "md",
}: {
  tier?: Tier;
  size?: "sm" | "md" | "lg";
}) {
  if (!tier) return null;
  const dim =
    size === "lg" ? "h-11 w-11 text-xl" : size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm";
  const color = TIER_COLOR[tier];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-display font-bold ${dim}`}
      style={{
        color,
        background: `color-mix(in oklab, ${color} 18%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 55%, transparent), 0 0 18px -4px ${color}`,
      }}
    >
      {tier}
    </span>
  );
}
