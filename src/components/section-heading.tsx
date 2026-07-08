import { Reveal } from "./reveal";
import Star from "./persona/star";

export default function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyber-400">
            <Star className="h-2.5 w-2.5" />
            {eyebrow}
            <span className="h-px w-10 -skew-x-12 bg-gradient-to-r from-cyber-500 to-transparent" />
          </p>
          <h2 className="text-persona relative inline-block text-3xl text-fog-100 sm:text-4xl">
            <span
              aria-hidden
              className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-1 -skew-x-6"
              style={{ background: "color-mix(in oklab, var(--color-brand-500) 22%, transparent)" }}
            />
            {title}
          </h2>
        </div>
        {action}
      </div>
    </Reveal>
  );
}
