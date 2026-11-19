"use client";

import { useEffect } from "react";

/**
 * Stops ArrowUp/ArrowDown from stepping the value of any `<input type="number">` in the app, so a
 * stray key press cannot silently change a price, quantity or limit. Typing and the field's own
 * min/max/step validation are unchanged. Mounted once in the root layout.
 */
export default function NumberInputGuard() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === "number"
          && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        event.preventDefault();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  return null;
}
