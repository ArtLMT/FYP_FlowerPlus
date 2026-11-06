import Button from "@/components/ui/Button";
import type { CustomMaterial } from "@/lib/services/custom-orders";

export type Material = CustomMaterial;

export const UNITS: Record<string, string> = { STEM: "cành", PIECE: "chiếc", METRE: "mét", SHEET: "tờ" };

const STEP_BUTTON = "flex h-10 w-10 flex-shrink-0 items-center justify-center text-primary-deep hover:bg-tertiary";

/** Minus, a box to type in, plus. Only materials sold by the metre move in steps of 0.1 m (10 cm). */
export default function QuantityStepper({ material, value, onSet, onChange, onSettle }: {
  material: Material;
  value: string;
  onSet: (material: Material, value: string) => void;
  onChange: (material: Material, change: number) => void;
  onSettle: (id: string) => void;
}) {
  const step = material.unitOfMeasure === "METRE" ? 0.1 : 1;
  return <div className="flex w-full items-center overflow-hidden rounded-lg border-[1.5px] border-primary-deep bg-white">
    <Button type="button" aria-label={`Giảm ${material.name}`} onClick={() => onChange(material, -step)} className={STEP_BUTTON}>
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">remove</span>
    </Button>
    <input
      aria-label={`Số lượng ${material.name}`}
      type="number"
      inputMode={step === 1 ? "numeric" : "decimal"}
      min={0}
      max={999}
      step={step}
      value={value}
      onChange={(event) => onSet(material, event.target.value)}
      onBlur={() => onSettle(material.id)}
      className="h-10 w-full min-w-0 bg-transparent text-center font-sans text-[16px] font-bold text-text-primary outline-none [appearance:textfield] focus:bg-neutral-surface [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
    <Button type="button" aria-label={`Thêm ${material.name}`} onClick={() => onChange(material, step)} className={STEP_BUTTON}>
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
    </Button>
  </div>;
}
