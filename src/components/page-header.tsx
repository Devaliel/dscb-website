import { Reveal } from "./reveal";
import Star from "./persona/star";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden px-6 pb-6 pt-36 sm:pt-44">
      <div className="pointer-events-none absolute inset-x-0 top-16 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-brand-500/15 blur-[110px]" />
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <span className="inline-block -skew-x-12 bg-brand-500 px-3 py-1">
            <span className="flex skew-x-12 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
              <Star className="h-2.5 w-2.5" />
              {eyebrow}
            </span>
          </span>
          <h1 className="text-persona mt-4 -rotate-1 text-5xl text-fog-100 sm:text-7xl">
            {title}
          </h1>
          <div
            className="mt-3 h-2 w-36 -skew-x-12"
            style={{ background: "linear-gradient(90deg, var(--color-brand-500), var(--color-cyber-500) 70%, transparent)" }}
          />
          {subtitle && <p className="mt-5 max-w-2xl text-lg text-fog-500">{subtitle}</p>}
        </Reveal>
      </div>
    </div>
  );
}
