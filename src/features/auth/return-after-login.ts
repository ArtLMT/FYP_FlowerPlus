/**
 * Where to go after signing in. Password login and email verification carry it in `?next=`; Google
 * login leaves the site and the backend always lands on "/", so the path is kept in sessionStorage
 * for that trip (same tab only) and picked up by ReturnAfterGoogleLogin.
 */

const KEY = "flowerplus.returnAfterLogin";
/** Long enough for Google's consent screen; a stale entry must not redirect a later visit. */
const MAX_AGE_MS = 10 * 60 * 1000;

/** Only a path on this site, so a crafted link cannot send anyone away: "/custom" yes, "//x.com" no. */
export function safeReturnPath(raw: string | null | undefined): string | null {
  return raw && /^\/(?![/\\])/.test(raw) ? raw : null;
}

/** The `?next=` of the current page, if it is safe. Browser only. */
export function nextFromUrl(): string | null {
  return safeReturnPath(new URLSearchParams(window.location.search).get("next"));
}

/** Called just before leaving for Google. */
export function rememberReturn(path: string | null) {
  try {
    if (path) sessionStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() }));
    else sessionStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the user simply lands on the home page, as before.
  }
}

/** Reads and forgets the remembered path. */
export function takeReturn(): string | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const { path, at } = JSON.parse(raw) as { path?: string; at?: number };
    return typeof at === "number" && Date.now() - at < MAX_AGE_MS ? safeReturnPath(path) : null;
  } catch {
    return null;
  }
}
