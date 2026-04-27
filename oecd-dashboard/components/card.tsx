import type { ReactNode } from "react";

export function Card({
  title,
  description,
  cta,
  children,
  className = "",
  padded = true,
}: {
  title?: ReactNode;
  description?: ReactNode;
  cta?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={[
        "bg-[var(--surface)] border border-[var(--border)] rounded-md",
        padded ? "p-5 md:p-6" : "",
        className,
      ].join(" ")}
    >
      {(title || description || cta) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && (
              <h3 className="font-serif text-[18px] md:text-[20px] leading-snug text-ink">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-[13px] text-[var(--muted)]">{description}</p>
            )}
          </div>
          {cta && <div className="shrink-0 text-[13px]">{cta}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "accent" | "forest";
}) {
  const styles =
    tone === "primary"
      ? "bg-[var(--primary-soft)] text-[var(--primary-deep)]"
      : tone === "accent"
        ? "bg-[var(--accent-soft)] text-[var(--alert)]"
        : tone === "forest"
          ? "bg-[var(--forest-soft)] text-[var(--forest)]"
          : "bg-black/5 text-[var(--muted)]";
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-mono uppercase tracking-wider",
        styles,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
