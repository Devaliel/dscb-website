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
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-40 blur-2xl"
        style={{ background: accent }}
      />
      <CountUp
        value={value}
        suffix={suffix}
        className="font-display text-4xl font-bold text-fog-100"
      />
      <p className="mt-1 text-sm text-fog-500">{label}</p>
    </div>
  );
}
