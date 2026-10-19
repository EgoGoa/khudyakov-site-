import * as R from "react/jsx-runtime";
import { localize } from "./core";

export const Fragment = R.Fragment;
export function jsx(type: unknown, props: Record<string, unknown>, key?: unknown) {
  return (R.jsx as (...a: unknown[]) => unknown)(type, localize(type, props), key);
}
export function jsxs(type: unknown, props: Record<string, unknown>, key?: unknown) {
  return (R.jsxs as (...a: unknown[]) => unknown)(type, localize(type, props), key);
}
export type { JSX } from "react/jsx-runtime";
