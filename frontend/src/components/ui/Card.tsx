import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: "section" | "article" | "aside" | "div";
  id?: string;
}

export function Card({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName,
  as: Component = "section",
  id,
}: CardProps) {
  const hasHeader = Boolean(title || actions);
  const headingId = id ? `${id}-title` : undefined;

  return (
    <Component
      id={id}
      aria-labelledby={headingId}
      className={clsx("rounded-card border border-border bg-surface shadow-card", className)}
    >
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                <Icon className="size-[18px]" aria-hidden />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 id={headingId} className="text-base font-bold leading-tight text-fg">
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-0.5 text-sm text-fg-muted">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={clsx("px-5 pb-5", hasHeader ? "pt-4" : "pt-5", bodyClassName)}>{children}</div>
    </Component>
  );
}
