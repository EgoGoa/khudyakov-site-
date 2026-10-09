"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCleanPathname } from "@/lib/use-clean-pathname";
import { serviceMeta, serviceOrder, slugToKey } from "@/lib/service-content";
import { ringOf, siblingsOf } from "@/components/home/direction/siblings";
import { NeonChevron } from "@/components/home/ServicePicker";
import { queueChapterHop } from "@/lib/page-hop";
import { guardNavigation } from "@/lib/sure-nav";
import { SHORT } from "@/components/layout/PageBar";
import { openSearch } from "@/lib/site-search";
import { SearchGlyph } from "@/components/layout/SiteSearch";

// Остров внизу экрана на телефоне (Егор, 2026-10-09, вариант C):
// ‹ 🔍 (волна) SMM › — стеклянная полоса на всю ширину вместо трёх отдельных
// элементов. Волна остаётся голосовым ассистентом и стоит в гнезде по
// центру. Стрелки остров рисует сам, с той же логикой, что PageSideNav и
// FormatSideNav (те живут внутри слоя страницы и не могут встать поверх
// острова) — на телефоне стоя прежние стрелки спрятаны (globals.css).
//
// Остров стоит по центру волны: её положение меряется живьём и кладётся в
// --wave-cy (расстояние от низа экрана до центра волны), ширина — в --wave-w.
// Только телефон и планшет стоя; у телефона боком и на компьютере его нет.

// Сама волна, без приглашения «Управляй сайтом голосом» над ней: иначе
// центр считался бы по волне вместе с приглашением, и остров уезжал вверх.
const WAVE = ".voice-dock-corner .voice-sphere";

function useDockMetrics() {
  const [hasWave, setHasWave] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    let ro: ResizeObserver | null = null;
    let seen: Element | null = null;
    const apply = () => {
      const dock = document.querySelector(WAVE);
      const r = dock?.getBoundingClientRect();
      const ok = !!r && r.height > 0;
      setHasWave(ok);
      if (ok) {
        root.style.setProperty("--wave-cy", `${Math.round(window.innerHeight - (r.top + r.height / 2))}px`);
        root.style.setProperty("--wave-w", `${Math.round(r.width)}px`);
      }
    };
    const tick = () => {
      const dock = document.querySelector(WAVE);
      if (dock && dock !== seen) {
        seen = dock;
        ro?.disconnect();
        ro = new ResizeObserver(apply);
        ro.observe(dock);
      }
      apply();
    };
    tick();
    const id = window.setInterval(tick, 700);
    window.addEventListener("resize", apply);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", apply);
      ro?.disconnect();
    };
  }, []);
  return hasWave;
}

type Hop = { href: string; label: string; onClick?: () => void };

/** Соседние страницы — те же, что у боковых стрелок. */
function hopsFor(path: string): { prev: Hop; next: Hop; kind: "page" | "format" } | null {
  const parts = path.split("/").filter(Boolean);
  const key = parts[0] ? slugToKey(parts[0]) : null;
  if (!key) return null;
  if (parts.length === 1) {
    const i = serviceOrder.indexOf(key);
    const n = serviceOrder.length;
    const hop = (k: (typeof serviceOrder)[number]): Hop => ({
      href: `/${serviceMeta[k].slug}`,
      label: serviceMeta[k].label,
      onClick: () => {
        queueChapterHop(key, serviceMeta[k].slug);
        guardNavigation(`/${serviceMeta[k].slug}`);
      },
    });
    return { prev: hop(serviceOrder[(i - 1 + n) % n]), next: hop(serviceOrder[(i + 1) % n]), kind: "page" };
  }
  if (parts.length !== 2) return null;
  const pair = siblingsOf(key, parts[1]);
  return pair ? { ...pair, kind: "format" } : null;
}

function Arrow({ hop, side, kind }: { hop: Hop; side: "prev" | "next"; kind: "page" | "format" }) {
  const prev = side === "prev";
  const noun = kind === "page" ? (prev ? "Предыдущая страница" : "Следующая страница") : prev ? "Предыдущий формат" : "Следующий формат";
  return (
    <Link
      href={hop.href}
      scroll={kind === "format"}
      onClick={hop.onClick}
      aria-label={`${noun}: ${hop.label}`}
      className="bottom-island__arrow"
    >
      <span className="page-nav-arrow-pulse">
        <NeonChevron flip={prev} className="h-8 w-8" />
      </span>
    </Link>
  );
}

/** Подпись справа от волны: где посетитель и какая это страница по счёту. */
function labelFor(path: string): { name: string; pos?: string } | null {
  const parts = path.split("/").filter(Boolean);
  const key = parts[0] ? slugToKey(parts[0]) : null;
  if (!key) return null;
  if (parts.length === 1) {
    return { name: SHORT[key], pos: `${serviceOrder.indexOf(key) + 1}/${serviceOrder.length}` };
  }
  const ring = ringOf(key);
  const i = ring.findIndex((s) => s.href === path);
  if (i < 0) return { name: SHORT[key] };
  return { name: SHORT[key], pos: `${i + 1}/${ring.length}` };
}

export default function BottomIsland() {
  const pathname = useCleanPathname();
  const hasWave = useDockMetrics();
  if (pathname.startsWith("/admin")) return null;
  const label = labelFor(pathname);
  const hops = hopsFor(pathname);

  return (
    <div className="bottom-island" data-wave={hasWave ? "" : undefined}>
      <div className="bottom-island__side">
        {hops && <Arrow hop={hops.prev} side="prev" kind={hops.kind} />}
        {hasWave && (
          <button type="button" onClick={openSearch} aria-label="Поиск по сайту" className="bottom-island__btn">
            <SearchGlyph className="h-[19px] w-[19px]" />
          </button>
        )}
      </div>
      {hasWave ? (
        <span className="bottom-island__wave" aria-hidden="true" />
      ) : (
        <button type="button" onClick={openSearch} className="bottom-island__field">
          <SearchGlyph className="h-[17px] w-[17px] shrink-0" />
          Поиск
        </button>
      )}
      <div className="bottom-island__side bottom-island__side--end">
        {label && (
          <span className="bottom-island__label" aria-hidden="true">
            <b>{label.name}</b>
            {label.pos && <span>{label.pos}</span>}
          </span>
        )}
        {hops && <Arrow hop={hops.next} side="next" kind={hops.kind} />}
      </div>
    </div>
  );
}
