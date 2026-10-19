import * as R from "react/jsx-dev-runtime";
import { localize } from "./core";

export const Fragment = R.Fragment;
export function jsxDEV(
  type: unknown,
  props: Record<string, unknown>,
  key: unknown,
  isStatic: boolean,
  source: unknown,
  self: unknown,
) {
  return (R.jsxDEV as (...a: unknown[]) => unknown)(type, localize(type, props), key, isStatic, source, self);
}
export type { JSX } from "react/jsx-dev-runtime";
