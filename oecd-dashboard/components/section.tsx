import type { ReactNode } from "react";

/**
 * Editorial-style section header used across the site.
 *
 *   <Section eyebrow="By the numbers" title="Where the world's foundations give"
 *            description="$68.2B disbursed across 506 foundations">
 *     ...children...
 *   </Section>
 */
export function Section({
  eyebrow,
  title,
  description,
  cta,
  children,
  id,
}: {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  cta?: ReactNode;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="mx-auto max-w-[1240px] px-6 lg:px-10 py-14 md:py-20 first:pt-10"
    >
      {(eyebrow || title || description) && (
        <div className="md:flex md:items-end md:justify-between gap-12 mb-10 md:mb-14">
          <div className="max-w-2xl">
            {eyebrow && (
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--accent)] mb-3">
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="font-serif text-[28px] md:text-[36px] leading-[1.15] text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-3 text-[15px] md:text-[16px] text-[var(--muted)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {cta && <div className="mt-6 md:mt-0">{cta}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--accent)]">
      {children}
    </div>
  );
}
