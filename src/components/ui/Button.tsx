import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** Base button used across the app: adds the shared disabled look; all styling comes from `className`. */
export default function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`transition-[opacity,filter] disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-50 ${className}`}
    >
      {children}
    </button>
  );
}
