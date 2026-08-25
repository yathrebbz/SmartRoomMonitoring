import { clsx } from "clsx";
import { LoaderCircle, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: LucideIcon;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-brand-fg shadow-[0_6px_16px_-8px_var(--brand)] hover:brightness-110",
  secondary: "border border-border bg-surface-2 text-fg hover:border-border-strong",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
  danger: "bg-bad-soft text-bad-fg hover:brightness-95",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon: Icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold",
        "transition-[background-color,border-color,color,filter,transform] duration-150 ease-out",
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
    >
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="size-4" aria-hidden />
      )}
      {children}
    </button>
  );
}
