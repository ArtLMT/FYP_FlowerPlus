import { UNITS } from "@/features/custom-order/QuantityStepper";
import type { MaterialUnit } from "@/lib/services/materials";
import { formatVND } from "@/lib/utils";

export interface TermsToCompare {
  arrangementTypeId: string;
  arrangementTypeName: string;
  price: number;
  materials: { materialId: string; materialName: string; unitOfMeasure: MaterialUnit; quantity: number }[];
}

/** What a proposal changes from the agreed terms, in plain words (screen inventory K13). */
export function changesFrom(agreed: TermsToCompare | null, proposal: TermsToCompare) {
  const changes: string[] = [];
  if (!agreed) return changes;
  if (agreed.arrangementTypeId !== proposal.arrangementTypeId) {
    changes.push(`Kiểu cắm: ${agreed.arrangementTypeName} → ${proposal.arrangementTypeName}`);
  }
  for (const material of proposal.materials) {
    const before = agreed.materials.find((line) => line.materialId === material.materialId);
    const unit = UNITS[material.unitOfMeasure] ?? "";
    if (!before) changes.push(`Thêm ${material.materialName}: ${material.quantity} ${unit}`);
    else if (Number(before.quantity) !== Number(material.quantity)) {
      changes.push(`${material.materialName}: ${before.quantity} → ${material.quantity} ${unit}`);
    }
  }
  for (const before of agreed.materials) {
    if (!proposal.materials.some((line) => line.materialId === before.materialId)) changes.push(`Bỏ ${before.materialName}`);
  }
  if (Number(agreed.price) !== Number(proposal.price)) {
    changes.push(`Giá: ${formatVND(agreed.price)} → ${formatVND(proposal.price)}`);
  }
  return changes;
}
