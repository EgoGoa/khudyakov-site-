"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CenterModal from "@/components/ui/CenterModal";
import { BOOT, useBootStage } from "@/lib/boot-sequence";
import { openLead } from "@/lib/lead";
import { openCabinet } from "@/components/cabinet/CabinetWindow";
import {
  OPEN_INSTALL_EVENT,
  PWA_ICONS,
  PWA_ICON_KEY,
  applyIcon,
  canOfferInstall,
  openInstall,
  promptInstall,
  useInstallMode,
  type InstallMode,
  type PwaIconId,
} from "@/lib/pwa";

// «Приложение на экран». Один компонент на весь сайт:
//  · регистрирует service worker (страница «Нет сети»);
//  · открывает окно выбора иконки и установки (из меню вайб-бара, кабинета,
//    голоса — через событие OPEN_INSTALL_EVENT);
//  · один раз показывает капсулу при втором визите;
//  · выполняет быстрые действия иконки приложения (?pwa=lead|cabinet|brief).

const GRAD = "linear-gradient(135deg,#F5310B,#EC4899 60%,#00D2FF)";
const CAPSULE_KEY = "hdkv_pwa_capsule_done";
const VISITS_KEY = "hdkv_visits";

const safeGet = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const safeSet = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* приватный режим — не страшно */
  }
};

function IconTile({ id, size, className = "" }: { id: PwaIconId; size: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статичный значок из public/pwa
    <img
      src={`/pwa/${id}-192.png`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{ width: size, height: size, borderRadius: size * 0.23 }}
    />
  );
}

function Steps({ mode }: { mode: InstallMode }) {
  const rows =
    mode === "ios"
      ? [
          "Нажми «Поделиться» внизу экрана в Safari",
          "Выбери «На экран Домой»",
          "Нажми «Добавить» — значок появится на рабочем столе",
        ]
      : mode === "macsafari"
        ? ["В меню Safari открой «Файл»", "Выбери «Добавить в Dock»", "Нажми «Добавить» — значок появится в Dock"]
        : ["Открой меню браузера (три точки)", "Выбери «Установить приложение» или «На главный экран»", "Подтверди — значок появится на экране"];
  return (
    <ol className="mt-4 space-y-2.5">
      {rows.map((r, i) => (
        <li key={r} className="flex items-start gap-3 text-[15px] font-bold leading-snug text-white">
          <span
            className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] font-extrabold text-white"
            style={{ background: GRAD }}
          >
            {i + 1}
          </span>
          <span>{r}</span>
        </li>
      ))}
    </ol>
  );
}

function InstallWindow({ open, mode, onClose }: { open: boolean; mode: InstallMode | null; onClose: () => void }) {
  const [icon, setIcon] = useState<PwaIconId>("hud");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    const saved = safeGet(PWA_ICON_KEY) as PwaIconId | null;
    const start = PWA_ICONS.some((i) => i.id === saved) ? (saved as PwaIconId) : "hud";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- сброс при каждом открытии окна
    setIcon(start);
    setNote("");
    applyIcon(start);
  }, [open]);

  const pick = (id: PwaIconId) => {
    setIcon(id);
    setNote("");
    safeSet(PWA_ICON_KEY, id);
    applyIcon(id);
  };

  const install = async () => {
    setBusy(true);
    applyIcon(icon);
    // Браузеру нужен миг, чтобы перечитать манифест с выбранной иконкой.
    await new Promise((r) => setTimeout(r, 250));
    try {
      const res = await promptInstall();
      if (res === "accepted") onClose();
      else if (res === "dismissed") setNote("Не вышло? Нажми ещё раз, когда будешь готов.");
      else setNote("Браузер пока не дал окно установки — поставь через его меню.");
    } catch {
      setNote("Браузер не смог открыть окно установки — поставь через его меню.");
    }
    setBusy(false);
  };

  const label = PWA_ICONS.find((i) => i.id === icon)?.label ?? "";

  return (
    <CenterModal open={open} onClose={onClose} ariaLabel="Приложение на экран" compact>
      <div className="px-1 pb-1 pt-1 text-white">
        <h2 className="font-display text-[22px] font-extrabold leading-tight sm:text-[26px]">
          HUD на <span className="kw">экране</span>
        </h2>
        <p className="mt-2 text-[15px] font-bold leading-snug text-white">
          Креативный сервис в один тап: без браузера, с личным кабинетом и голосовым помощником под рукой.
        </p>

        <div className="mt-5 flex items-center gap-4">
          <IconTile id={icon} size={84} />
          <div className="min-w-0">
            <div className="font-display text-[15px] font-extrabold">{label}</div>
            <div className="text-[13px] font-bold text-white">Так значок выглядит на экране</div>
          </div>
        </div>

        <p className="mt-5 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#A4F4FD]">Выбери иконку</p>
        <div
          role="radiogroup"
          aria-label="Иконка приложения"
          className="mt-2 grid grid-cols-4 justify-items-center gap-x-2 gap-y-3 py-1"
        >
          {PWA_ICONS.map((i) => {
            const on = i.id === icon;
            return (
              <button
                key={i.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={i.label}
                onClick={() => pick(i.id)}
                className="rounded-[18px] p-[3px] transition-transform duration-200 active:scale-95"
                style={{
                  background: on ? GRAD : "transparent",
                  transform: on ? "scale(1.06)" : undefined,
                }}
              >
                <span className="block rounded-[15px] bg-[#0B0B10] p-[2px]">
                  <IconTile id={i.id} size={62} />
                </span>
              </button>
            );
          })}
        </div>

        {mode === "prompt" ? (
          <button
            type="button"
            onClick={install}
            disabled={busy}
            className="mt-4 w-full rounded-full px-6 py-3.5 font-display text-[15px] font-extrabold text-white transition-[filter,transform] active:scale-[0.98]"
            style={{ background: "linear-gradient(90deg,#F5310B,#FF6A3D)" }}
          >
            Поставить на экран
          </button>
        ) : mode ? (
          <Steps mode={mode} />
        ) : null}
        {note && <p className="mt-3 text-[14px] font-bold text-[#A4F4FD]">{note}</p>}
        {mode === "ios" && (
          <p className="mt-3 text-[13px] font-bold text-[#A4F4FD]">
            Apple не даёт сайтам ставить значок сам — поэтому два нажатия руками. Выбранная иконка подтянется.
          </p>
        )}
      </div>
    </CenterModal>
  );
}

export default function InstallApp() {
  const mode = useInstallMode();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [capsule, setCapsule] = useState(false);
  const bootDone = useBootStage(BOOT.smoke);

  const close = useCallback(() => setOpen(false), []);

  // Окно открывают из меню, кабинета и голоса.
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener(OPEN_INSTALL_EVENT, on);
    return () => window.removeEventListener(OPEN_INSTALL_EVENT, on);
  }, []);

  // Service worker — страница «Нет сети». Не мешает загрузке: ждём load.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const reg = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") reg();
    else window.addEventListener("load", reg, { once: true });
  }, []);

  // Быстрые действия иконки: долгое нажатие → ?pwa=lead|cabinet|brief.
  useEffect(() => {
    const url = new URL(window.location.href);
    const act = url.searchParams.get("pwa");
    if (!act) return;
    url.searchParams.delete("pwa");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    const t = window.setTimeout(() => {
      if (act === "lead") openLead();
      else if (act === "cabinet") openCabinet();
      else if (act === "brief") router.push("/brief");
    }, 2800);
    return () => window.clearTimeout(t);
  }, [router]);

  // Капсула: один раз, на втором и дальнейших визитах, когда сайт доигрался.
  useEffect(() => {
    if (!bootDone || !canOfferInstall(mode)) return;
    if (safeGet(CAPSULE_KEY)) return;
    let visits = Number(safeGet(VISITS_KEY) || 0);
    try {
      if (!sessionStorage.getItem("hdkv_visit_counted")) {
        sessionStorage.setItem("hdkv_visit_counted", "1");
        visits += 1;
        safeSet(VISITS_KEY, String(visits));
      }
    } catch {
      /* без sessionStorage считаем как есть */
    }
    if (visits < 2) return;
    const show = window.setTimeout(() => {
      setCapsule(true);
      safeSet(CAPSULE_KEY, "1");
    }, 4000);
    return () => window.clearTimeout(show);
  }, [bootDone, mode]);

  useEffect(() => {
    if (!capsule) return;
    const t = window.setTimeout(() => setCapsule(false), 14000);
    return () => window.clearTimeout(t);
  }, [capsule]);

  return (
    <>
      <InstallWindow open={open} mode={mode} onClose={close} />
      <AnimatePresence>
        {capsule && !open && (
          <motion.button
            key="install-capsule"
            type="button"
            onClick={() => {
              setCapsule(false);
              openInstall();
            }}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 420, damping: 30 } }}
            exit={{ opacity: 0, y: 16, scale: 0.94, transition: { duration: 0.25 } }}
            className="install-capsule fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[64] flex items-center gap-3 rounded-full bg-[#0B0B10]/80 py-2 pl-2 pr-4 text-left text-white backdrop-blur-[15px]"
            aria-label="Поставить HUD на экран"
          >
            <IconTile id="hud" size={36} />
            <span className="font-display text-[13px] font-extrabold leading-tight">
              Поставить HUD
              <br />
              на экран
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
