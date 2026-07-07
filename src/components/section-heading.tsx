import { Reveal } from "./reveal";

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
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-fog-500">
            <span className="h-px w-6 bg-gradient-to-r from-brand-500 to-transparent" />
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold text-fog-100 sm:text-4xl">{title}</h2>
        </div>
        {action}
      </div>
    </Reveal>
  );
}
