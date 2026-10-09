"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { sureNavigate } from "@/lib/sure-nav";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { useCinematicGoTo } from "@/lib/cinematic-nav";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { queueFirstChapter } from "@/lib/page-hop";
import { openLead } from "@/lib/lead";
import { openInstall } from "@/lib/pwa";
import { openCabinet } from "@/components/cabinet/CabinetWindow";
import SectionIcon from "@/components/ui/SectionIcon";
import { CloseIcon, PhoneIcon, TelegramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import {
  GROUP_LABEL,
  OPEN_SEARCH_EVENT,
  PHONE_HREF,
  POPULAR_IDS,
  TELEGRAM_URL,
  WHATSAPP_URL,
  highlight,
  pushRecent,
  readRecent,
  search,
  searchIndex,
  type SearchEntry,
  type SearchGroup,
} from "@/lib/site-search";

// Окно поиска (Егор, 2026-10-09, по образцу Higgsfield). На телефоне —
// шторка снизу во весь экран, на компьютере — окно по центру. Открывается
// лупой в острове внизу (телефон), лупой в шапке и сочетанием ⌘/Ctrl+K.
//
// Окно смонтировано всегда и только прячется: на iPhone клавиатура выезжает,
// лишь если поле получило фокус в том же нажатии, — поэтому открытие
// синхронное (flushSync), и фокус ставится сразу за ним.

const CHIPS: ("all" | SearchGroup)[] = ["all", "content", "ai", "sites", "smm", "contact"];
const TOP_LEVEL = new Set(["/content", "/ai", "/sites", "/smm"]);

type Section = { title: string; items: SearchEntry[] };

export function SearchGlyph({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.2 4.2" />
    </svg>
  );
}

function EntryIcon({ icon }: { icon: SearchEntry["icon"] }) {
  if (icon === "telegram") return <TelegramIcon className="h-[18px] w-[18px]" />;
  if (icon === "whatsapp") return <WhatsAppIcon className="h-[18px] w-[18px]" />;
  if (icon === "phone") return <PhoneIcon className="h-[18px] w-[18px]" />;
  return <SectionIcon name={icon} size={20} />;
}

function Title({ text, query }: { text: string; query: string }) {
  const hl = query ? highlight(text, query) : null;
  if (!hl) return <>{text}</>;
  return (
    <>
      {text.slice(0, hl[0])}
      <mark className="bg-transparent text-[#5eead4]">{text.slice(hl[0], hl[1])}</mark>
      {text.slice(hl[1])}
    </>
  );
}

export default function SiteSearch() {
  const pathname = useCleanPathname();
  const router = useRouter();
  const goToChapter = useCinematicGoTo();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<"all" | SearchGroup>("all");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useBodyScrollLock(open);

  // Открытие: событие (остров, шапка) и ⌘/Ctrl+K.
  useEffect(() => {
    const show = () => {
      openerRef.current = document.activeElement as HTMLElement | null;
      flushSync(() => {
        setOpen(true);
        setRecent(readRecent());
      });
      inputRef.current?.focus({ preventScroll: true });
      inputRef.current?.select();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener(OPEN_SEARCH_EVENT, show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_SEARCH_EVENT, show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const close = () => {
    setOpen(false);
    inputRef.current?.blur();
    const opener = openerRef.current;
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  };

  // Сменилась страница (например, назад в браузере) — окно закрывается.
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  const index = useMemo(() => searchIndex(), []);
  const byId = useMemo(() => new Map(index.map((e) => [e.id, e])), [index]);
  const hits = useMemo(() => search(query), [query]);
  const q = query.trim();

  const counts = useMemo(() => {
    const c: Partial<Record<SearchGroup, number>> = {};
    for (const h of hits) c[h.e.group] = (c[h.e.group] ?? 0) + 1;
    return c;
  }, [hits]);

  const sections: Section[] = useMemo(() => {
    const inChip = (e: SearchEntry) => chip === "all" || e.group === chip;
    if (q) {
      const items = hits.map((h) => h.e).filter(inChip).slice(0, 30);
      const out: Section[] = items.length ? [{ title: "", items }] : [];
      // Ничего не нашлось — сразу к людям.
      if (items.length < 3) {
        out.push({ title: "Не нашли? Спросите нас", items: ["telegram", "lead", "call"].map((id) => byId.get(id)!).filter((e) => !items.includes(e)) });
      }
      return out;
    }
    if (chip !== "all") {
      return [{ title: GROUP_LABEL[chip], items: index.filter(inChip).sort((a, b) => b.rank - a.rank) }];
    }
    const rec = recent.map((id) => byId.get(id)).filter((e): e is SearchEntry => !!e);
    const pop = POPULAR_IDS.map((id) => byId.get(id)!).filter((e) => e && !rec.includes(e));
    const dirs = index.filter((e) => e.id.startsWith("dir-"));
    const contact = index.filter((e) => e.group === "contact" && !pop.includes(e) && !rec.includes(e));
    return [
      ...(rec.length ? [{ title: "Недавние", items: rec }] : []),
      { title: "Популярное", items: pop },
      { title: "Направления", items: dirs },
      { title: "Связь", items: contact },
    ];
  }, [q, hits, chip, index, byId, recent]);

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  // Выбранный стрелками пункт всегда в поле зрения.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (e: SearchEntry) => {
    pushRecent(e.id);
    close();
    setQuery("");
    setChip("all");
    if (e.act) {
      if (e.act === "call") window.location.assign(PHONE_HREF);
      else if (e.act === "telegram") window.open(TELEGRAM_URL, "_blank", "noopener");
      else if (e.act === "whatsapp") window.open(WHATSAPP_URL, "_blank", "noopener");
      else if (e.act === "lead") openLead();
      else if (e.act === "cabinet") openCabinet();
      else if (e.act === "install") openInstall();
      return;
    }
    if (!e.href) return;
    const [path, hash] = e.href.split("#");
    if (path === pathname) {
      if (hash) {
        if (!goToChapter(hash)) document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    // Страница направления без главы — как из шапки: сразу к первому блоку.
    if (!hash && TOP_LEVEL.has(path)) {
      const fromDeck = !!document.querySelector("[data-stage-wrap]");
      queueFirstChapter();
      sureNavigate(router, path, { scroll: !fromDeck });
      return;
    }
    sureNavigate(router, e.href);
  };

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key === "Escape") {
      ev.preventDefault();
      close();
    } else if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (ev.key === "Enter" && flat[active]) {
      ev.preventDefault();
      choose(flat[active]);
    }
  };

  let n = -1;
  const row = (e: SearchEntry): ReactNode => {
    n += 1;
    const i = n;
    const external = e.act === "telegram" || e.act === "whatsapp";
    return (
      <li key={`${e.id}-${i}`} role="option" aria-selected={i === active} id={`ss-opt-${i}`}>
        <button
          type="button"
          data-i={i}
          tabIndex={-1}
          onMouseMove={() => i !== active && setActive(i)}
          onClick={() => choose(e)}
          className={`flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors duration-150 ${
            i === active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
          }`}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-paper/85">
            <EntryIcon icon={e.icon} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold leading-snug text-paper">
              <Title text={e.title} query={q} />
            </span>
            <span className="block truncate text-[12.5px] leading-snug text-paper/50">{e.sub}</span>
          </span>
          <span aria-hidden="true" className={`shrink-0 pr-1 text-paper/30 ${i === active ? "text-paper/70" : ""}`}>
            {external ? "↗" : "›"}
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="site-search" data-open={open ? "" : undefined} inert={!open} aria-hidden={!open}>
      <button type="button" tabIndex={-1} aria-label="Закрыть поиск" className="site-search__dim" onClick={close} />
      <div role="dialog" aria-modal="true" aria-label="Поиск по сайту" className="site-search__panel" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-2.5 px-3.5 pt-3.5 lg:px-4 lg:pt-4">
          <label className="flex h-12 flex-1 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] pl-4 pr-1.5 focus-within:border-white/25">
            <SearchGlyph className="h-[18px] w-[18px] shrink-0 text-paper/55" />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="go"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Найти на сайте"
              aria-label="Найти на сайте"
              role="combobox"
              aria-expanded={open}
              aria-controls="ss-list"
              aria-activedescendant={flat.length ? `ss-opt-${active}` : undefined}
              value={query}
              onChange={(ev) => {
                setQuery(ev.target.value);
                setActive(0);
              }}
              className="site-search__input h-full min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-paper placeholder:text-paper/40 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="shrink-0 px-2 text-[12px] font-semibold text-paper/50 hover:text-paper"
              >
                Стереть
              </button>
            )}
            <kbd className="mr-2 hidden shrink-0 rounded-md border border-white/15 px-1.5 py-0.5 font-sans text-[11px] text-paper/45 lg:block">Esc</kbd>
          </label>
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть поиск"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.07] text-paper/80 transition-colors hover:bg-white/[0.12] hover:text-paper"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="site-search__chips flex gap-1.5 overflow-x-auto px-3.5 pb-1 pt-3 lg:px-4">
          {CHIPS.map((c) => {
            const count = c === "all" ? hits.length : counts[c] ?? 0;
            if (q && c !== "all" && !count) return null;
            const on = chip === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setChip(c);
                  setActive(0);
                }}
                aria-pressed={on}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  on ? "border-paper bg-paper text-ink" : "border-white/12 text-paper/75 hover:border-white/30 hover:text-paper"
                }`}
              >
                {c === "all" ? "Все" : GROUP_LABEL[c]}
                {q ? <span className={on ? "text-ink/55" : "text-paper/40"}> · {count}</span> : null}
              </button>
            );
          })}
        </div>

        <div ref={listRef} id="ss-list" role="listbox" aria-label="Результаты" className="site-search__list flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1 lg:px-2.5">
          {sections.map((s, si) => (
            <div key={`${s.title}-${si}`} className="mt-2 first:mt-1">
              {s.title && <div className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-paper/40">{s.title}</div>}
              <ul className={s.title === "Направления" || s.title === "Популярное" ? "lg:grid lg:grid-cols-2 lg:gap-x-2" : ""}>
                {s.items.map(row)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
