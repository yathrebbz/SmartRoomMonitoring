import { clsx } from "clsx";

interface SwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

export function Switch({ id, label, description, checked, onChange }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-fg">
          {label}
        </label>
        {description && <p className="text-xs text-fg-muted">{description}</p>}
      </div>

      {/* Zone cliquable de 44 px de haut, piste visuelle plus petite à l'intérieur. */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="group -mr-2 flex h-11 w-16 shrink-0 cursor-pointer items-center justify-center rounded-lg"
      >
        <span
          className={clsx(
            "relative block h-7 w-12 rounded-full border transition-colors duration-200",
            checked ? "border-brand bg-brand" : "border-border-strong bg-surface-2",
          )}
        >
          <span
            className={clsx(
              "absolute top-0.5 left-0.5 block size-[22px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
              "transition-transform duration-200 ease-out",
              checked && "translate-x-5",
            )}
          />
        </span>
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}
