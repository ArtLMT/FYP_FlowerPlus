import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Replaces the route with `href` whenever the viewport is desktop-sized (md: 768px and up). */
export function useDesktopRedirect(href: string) {
  const router = useRouter();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    if (desktop.matches) router.replace(href);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) router.replace(href);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [router, href]);
}
