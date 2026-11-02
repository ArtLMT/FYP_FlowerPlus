import type { MaterialStatus } from "@/lib/services/materials";
import { materialStatusLabel } from "@/features/admin/material-labels";

/** Status pill reused on Material cards and the Material detail modal. */
export default function MaterialStatusBadge({ status }: { status: MaterialStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "ACTIVE" ? "bg-accent-sage-light text-text-primary" : "bg-neutral-raised text-text-secondary"}`}>
      {materialStatusLabel(status)}
    </span>
  );
}
