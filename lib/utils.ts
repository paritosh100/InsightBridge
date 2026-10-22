import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the path only if it is a plain on-site path ("/result?rid=1"),
 * otherwise "/". Blocks "@evil.com", ".evil.com", "//evil.com", "/\evil.com",
 * "https://evil.com" and control characters browsers strip before parsing.
 */
export function safeRedirectPath(path: string | null | undefined): string {
    return path && /^\/(?![\/\\])[^@\\\x00-\x1f]*$/.test(path) ? path : "/";
}
