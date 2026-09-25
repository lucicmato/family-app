/**
 * `next` arrives from the query string, so anyone can craft it. Resolving it
 * against our own origin and comparing origins catches every trick that
 * string checks miss (`//evil.com`, `/\evil.com`, `@evil.com`, tabs/newlines
 * the URL parser strips) — anything that leaves the app falls back to "/".
 * The normalised path is re-checked too: `/..//evil.com` resolves to
 * `//evil.com`, which is protocol-relative if a caller ever uses it bare.
 */
export const safeNextPath = (next: string | null, origin: string): string => {
  if (!next?.startsWith("/")) return "/";

  try {
    const url = new URL(next, origin);
    if (url.origin !== origin || url.pathname.startsWith("//")) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
};
