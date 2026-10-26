import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, children, action, icon }: { title: string; children?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-md border-2 border-dashed border-borde bg-piedra-clara p-6 md:p-8" role="note">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-white text-tinta ring-1 ring-borde">{icon ?? <Info size={22} strokeWidth={1.75} aria-hidden />}</div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-tinta">{title}</p>
          {children && <div className="mt-1.5 max-w-[62ch] text-[0.9375rem] text-texto">{children}</div>}
          {action && <div className="mt-4 flex flex-wrap gap-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}

