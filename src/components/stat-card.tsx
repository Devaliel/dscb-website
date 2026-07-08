import CountUp from "./count-up";

export default function StatCard({
  label,
  value,
  suffix = "",
  accent = "var(--color-brand-400)",
}: {
  label: string;
  value: number;
  suffix?: string;
  accent?: string;
}) {
  return (
    <div
      className="relative -skew-x-6 overflow-hidden border border-white/10 bg-ink-850 p-5"
      style={{ boxShadow: `4px 4px 0 rgba(0,0,0,0.5), inset 0 0 0 0 transparent` }}
    >
      <div className="halftone absolute inset-0 opacity-[0.04]" aria-hidden />
      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-40 blur-2xl"
        style={{ background: accent }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent 75%)` }}
      />
      <div className="skew-x-6">
        <CountUp
          value={value}
          suffix={suffix}
          className="font-display text-4xl font-extrabold italic text-fog-100"
        />
        <p className="mt-1 text-[12px] uppercase tracking-wider text-fog-500">{label}</p>
      </div>
    </div>
  );
}
