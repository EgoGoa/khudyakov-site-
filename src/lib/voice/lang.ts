// Язык голосового ассистента — по языку страницы (<html lang>, его ставит
// корневой layout). Вызывается в обработчиках и эффектах, а не при рендере.
export const isEnglishSite = () => typeof document !== "undefined" && document.documentElement.lang === "en";

/** Язык распознавания речи браузера. */
export const sttLang = () => (isEnglishSite() ? "en-US" : "ru-RU");

/** Префикс языка для выбора голоса браузера («en» / «ru»). */
export const voicePrefix = () => (isEnglishSite() ? "en" : "ru");
