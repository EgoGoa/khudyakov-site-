import { registerDict, setServerLocale } from "./core";
import enDict from "../../../messages/en.packed.json";

// Серверная часть: словарь и язык запроса для серверных компонентов.
export function enableEnglishForRequest() {
  registerDict(enDict as unknown as Parameters<typeof registerDict>[0]);
  setServerLocale("en");
}
