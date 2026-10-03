"use client";

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { markMediaReady } from "@/lib/boot-sequence";

// Шоурил за заголовком шапки. Егор (2026-10-03): он должен включаться сразу —
// при любой скорости интернета, с VPN и без. Поэтому:
//
//  1. Ролик лежит на самом сайте (никакого YouTube и чужих серверов) и
//     стоит в HTML с первой секунды: <video> рисуется сервером, а не
//     появляется после загрузки скриптов, как было (`useEffect` →
//     `loadReel`). Браузер начинает качать его, пока скрипты ещё в пути.
//  2. Сначала всегда играет лёгкая нарезка (640px, ~290 кбит/с, moov-атом
//     в начале файла — играет, не дожидаясь конца загрузки). Кадр-постер
//     под ним держит место, пока идут первые байты.
//  3. На широком экране с нормальной связью следом тихо догружается
//     полноразмерная версия и подменяется плавным наплывом — без чёрной
//     вспышки и скачка кадра. Если связь не тянет, остаётся лёгкая: она
//     размыта и увеличена, так что на глаз почти не отличается.
//  4. Если браузер не дал автозапуск (экономия заряда в iOS, например),
//     ролик запускается первым же касанием или прокруткой.

const LITE = "/video/showreel-hero-mobile.mp4";
const HD = "/video/showreel-hero.mp4";
const POSTER = "/images/showreel-frame.jpg";

type Conn = { saveData?: boolean; effectiveType?: string };

function canUpgrade() {
  if (window.innerWidth < 900) return false;
  const c = (navigator as Navigator & { connection?: Conn }).connection;
  if (c?.saveData) return false;
  return !/^(slow-2g|2g|3g)$/.test(c?.effectiveType ?? "");
}

export default function HeroReel({ className }: { className: string }) {
  // Подсказка браузеру из <head>: начать качать лёгкую версию сразу, с
  // высоким приоритетом. Без неё на медленной связи ролик вставал в очередь
  // за скриптами и стартовал на секунды позже (замер Chrome со связью 3G).
  preload(LITE, { as: "video", fetchPriority: "high" });
  const liteRef = useRef<HTMLVideoElement>(null);
  const hdRef = useRef<HTMLVideoElement>(null);
  const [hdMounted, setHdMounted] = useState(false);
  const [hdShown, setHdShown] = useState(false);
  const [liteGone, setLiteGone] = useState(false);

  // Автозапуск: событие canplay могло прийти ещё до гидрации — тогда
  // обработчик React его не увидел, поэтому состояние проверяем сами.
  useEffect(() => {
    const v = liteRef.current;
    if (!v) return;
    if (v.readyState >= 3) markMediaReady();
    const kick = () => {
      if (v.paused) v.play().catch(() => {});
    };
    kick();
    // Автозапуск запрещён — ждём первого жеста и запускаем.
    const events = ["pointerdown", "touchstart", "keydown", "scroll"] as const;
    const unlock = () => {
      kick();
      events.forEach((e) => window.removeEventListener(e, unlock));
    };
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, []);

  // Апгрейд до полного качества: только когда лёгкая версия уже играет, а
  // связь и экран позволяют.
  useEffect(() => {
    const v = liteRef.current;
    if (!v || !canUpgrade()) return;
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(() => setHdMounted(true), 1200);
    };
    if (!v.paused && v.readyState >= 3) start();
    else v.addEventListener("playing", start, { once: true });
    return () => {
      v.removeEventListener("playing", start);
      window.clearTimeout(timer);
    };
  }, []);

  // Полная версия загрузилась: встаёт на то же место ролика, а показывается
  // наплывом, когда реально пошла картинка (событие `playing`), и только
  // потом лёгкая убирается. Опираться на промис play() нельзя: стартовое
  // окно сайта (welcome-freeze) ставит все ролики на паузу, и промис тогда
  // отклоняется — полная версия так и оставалась невидимой.
  useEffect(() => {
    const hd = hdRef.current;
    const lite = liteRef.current;
    if (!hdMounted || !hd || !lite) return;
    let t = 0;
    const reveal = () => {
      setHdShown(true);
      t = window.setTimeout(() => {
        lite.pause();
        setLiteGone(true);
      }, 800);
    };
    const swap = () => {
      try {
        hd.currentTime = (lite.currentTime + 0.25) % (hd.duration || Infinity);
      } catch {}
      hd.play().catch(() => {});
    };
    hd.addEventListener("playing", reveal, { once: true });
    hd.addEventListener("canplaythrough", swap, { once: true });
    return () => {
      hd.removeEventListener("playing", reveal);
      hd.removeEventListener("canplaythrough", swap);
      window.clearTimeout(t);
    };
  }, [hdMounted]);

  return (
    <>
      {!liteGone && (
        <video
          ref={liteRef}
          data-hero-reel=""
          className={className}
          src={LITE}
          poster={POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Шоурил HUD.SERVICE"
          onCanPlay={markMediaReady}
          onError={markMediaReady}
        />
      )}
      {hdMounted && (
        <video
          ref={hdRef}
          data-hero-reel=""
          className={className}
          style={{ opacity: hdShown ? 1 : 0, transitionProperty: "filter, opacity", transitionDuration: "0.5s, 0.7s" }}
          src={HD}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      )}
    </>
  );
}
