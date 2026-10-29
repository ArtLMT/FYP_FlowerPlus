import type { ChangeEvent } from "react";

/** The files picked in a file input, clearing it so picking the same file again still fires onChange. */
export function takeFiles(event: ChangeEvent<HTMLInputElement>): File[] {
  const files = Array.from(event.target.files ?? []);
  event.target.value = "";
  return files;
}
