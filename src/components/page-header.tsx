import { Reveal } from "./reveal";

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
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-fog-500">
            <span className="h-px w-8 bg-gradient-to-r from-brand-500 to-transparent" />
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl font-bold text-fog-100 sm:text-6xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-lg text-fog-500">{subtitle}</p>}
        </Reveal>
      </div>
    </div>
  );
}
