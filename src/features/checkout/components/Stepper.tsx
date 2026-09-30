import { Fragment } from "react";

const STEPS = [
  { n: 1, label: "GIAO HÀNG" },
  { n: 2, label: "XÁC NHẬN" },
  { n: 3, label: "HOÀN TẤT" },
] as const;

/**
 * Stepper — the 1-2-3 progress indicator shared by the Delivery and Confirm
 * steps. `current` marks which step you're on; steps at or before it are
 * filled, later steps are outlined.
 */
export default function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-start px-9 pt-[26px] md:max-w-2xl md:mx-auto md:px-4 md:pt-10">
      {STEPS.map((step, i) => {
        const done = step.n <= current;
        return (
          <Fragment key={step.n}>
            <div className="flex flex-col items-center gap-[9px] w-14 md:w-16 flex-shrink-0">
              <div
                className={`w-[38px] h-[38px] md:w-11 md:h-11 rounded-full flex items-center justify-center font-sans font-bold text-[16px] md:text-[18px] ${
                  done ? "bg-primary text-white" : "border-[1.5px] border-neutral-border text-text-muted"
                }`}
              >
                {step.n}
              </div>
              <span
                className={`font-sans font-bold text-[11px] md:text-[12px] tracking-[0.08em] ${
                  done ? "text-primary" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[2px] bg-neutral-border mt-[18px] md:mt-[21px]" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
