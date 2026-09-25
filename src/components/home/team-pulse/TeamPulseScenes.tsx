"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TeamPulseChatVisual, TeamPulseScene } from "./types";
import { marks } from "./marks";
import { TEAM } from "@/lib/team";
import { TelegramIcon } from "@/components/ui/Icons";

// Графика человека команды — «живая вёрстка»: мини-сайты, телефон с
// формой, карточка товара, которые двигаются как интерфейс, а не схема.
//
// Два набора сцен, и они разные (решение Егора):
//   · сцены рассказа — по одной на тезис большого окна;
//   · сцены чата — по одной на вопрос Саши: показывают варианты ответа
//     картинками, и выбранный вариант подсвечивается.
// У каждой сцены сверху заголовок в стиле сайта (дисплейный капс, одно
// слово в градиенте) и строка-пояснение, что мы видим. Мелкого «рыбного»
// текста и тонкого моноширинного шрифта внутри графики нет — Егор сказал,
// что их не читают и они выглядят сгенерированными.
//
// Сцена рисуется на фиксированной «сцене» 480×440 и целиком масштабируется
// под коробку окна. Цвета — из акцента страницы (--sp-from / --sp-to).
const W = 480;
const H = 440;
const SPRING = { type: "spring", stiffness: 180, damping: 22 } as const;
const ACC = "linear-gradient(135deg, var(--sp-from), var(--sp-to))";

/** Длина одного цикла каждой сцены рассказа. Окно переключает тезис ровно
 *  тогда, когда сцена доиграла, — один цикл и сразу следующая (ритм,
 *  который Егор попросил держать везде в окнах команды). */
export const SCENE_MS: Record<TeamPulseScene, number> = {
  concepts: 6000,
  lead: 5200,
  catalog: 4600,
  rebrand: 5000,
  timeline: 5600,
  calendar: 5200,
  contact: 5200,
  team: 5200,
  aiPilot: 5600,
  aiSavings: 5200,
  aiPrompts: 5600,
  aiCrew: 5200,
  contentTimeline: 5600,
  contentContact: 5200,
  contentCrew: 5200,
  maxHooks: 5600,
  maxStoryboard: 5200,
  maxConcepts: 5200,
  maxCreative: 5000,
  dimaPhotoToVideo: 5200,
  dimaFormats: 4800,
  dimaAvatar: 5000,
  dimaModels: 5200,
  smmTimeline: 5600,
  smmContact: 5200,
  smmCrew: 5200,
  tanyaGrid: 5000,
  tanyaReach: 5200,
  tanyaPlan: 5200,
  tanyaReport: 5000,
};

function Stage({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setScale(Math.min(width / W, height / H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

/** Заголовок сцены: *звёздочками* — слово в градиенте страницы. */
function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <motion.div className="absolute inset-x-5 top-4" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
      <p className="font-display text-[21px] font-bold uppercase leading-[1.05] text-white">
        {marks(title)}
      </p>
      <p className="mt-1.5 font-display text-[11px] font-bold uppercase leading-snug tracking-tight text-white">{marks(sub)}</p>
    </motion.div>
  );
}

/** Графика под заголовком: своя область 480×360, как раньше у сцен. */
function Body({ children }: { children: ReactNode }) {
  return <div className="absolute left-0 top-[80px] h-[360px] w-[480px]">{children}</div>;
}

function useTick(ms: number, enabled = true) {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled || reduced) return;
    const t = setInterval(() => setTick((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [ms, enabled, reduced]);
  return tick;
}

function Dots({ light = false }: { light?: boolean }) {
  return (
    <>
      {[0, 1, 2].map((d) => (
        <i key={d} className={`h-[7px] w-[7px] rounded-full ${light ? "bg-black/20" : "bg-white/30"}`} />
      ))}
    </>
  );
}

/* ═══ Сцены рассказа ═══════════════════════════════════════════════════ */

const SITES = [
  { label: "A · Смело", bg: "#101118", bar: "#181a22", line: "rgba(255,255,255,.22)", hero: "linear-gradient(135deg, var(--sp-from), #6d28d9)", title: "Громко\nи смело", titleInk: "#fff", btn: ACC },
  { label: "B · Премиум", bg: "#f5f2ec", bar: "#e7e2d8", line: "rgba(0,0,0,.14)", hero: "linear-gradient(160deg, #e3d8c6, #b7a37f)", title: "Тихий\nпремиум", titleInk: "#161616", btn: "#111" },
  { label: "C · Свежо", bg: "#0c1719", bar: "#122125", line: "rgba(255,255,255,.22)", hero: "linear-gradient(135deg, #0f766e, var(--sp-to))", title: "Свежо\nи легко", titleInk: "#fff", btn: "var(--sp-to)" },
];

function MiniSite({ s, active }: { s: (typeof SITES)[number]; active: boolean }) {
  const light = s.bg === "#f5f2ec";
  return (
    <div
      className="w-[220px] overflow-hidden rounded-[14px]"
      style={{
        background: s.bg,
        boxShadow: active
          ? "0 30px 70px rgba(0,0,0,.6), 0 0 0 1.5px rgba(var(--tp-to-rgb),.9), 0 0 40px rgba(var(--tp-from-rgb),.45)"
          : "0 24px 50px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.12)",
      }}
    >
      <div className="flex h-[22px] items-center gap-[5px] px-[9px]" style={{ background: s.bar }}>
        <Dots light={light} />
      </div>
      <div className="p-[12px]">
        <div className="flex h-[96px] items-end rounded-[10px] p-[10px]" style={{ background: s.hero }}>
          <span className="whitespace-pre-line font-display text-[16px] font-bold uppercase leading-[1]" style={{ color: s.titleInk }}>
            {s.title}
          </span>
        </div>
        <div className="mt-2.5 h-[7px] w-[86%] rounded-full" style={{ background: s.line }} />
        <div className="mt-1.5 h-[7px] w-[58%] rounded-full" style={{ background: s.line }} />
        <div className="mt-3 h-[26px] w-[104px] rounded-full" style={{ background: s.btn }} />
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((d) => (
            <i key={d} className="h-[34px] rounded-[7px]" style={{ background: s.line }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ConceptsFan({ variant, once = false }: { variant?: number; once?: boolean }) {
  const tick = useTick(1900, (variant === undefined || variant < 0));
  const auto = once ? Math.min(tick, 2) : tick % 3;
  const front = variant !== undefined && variant >= 0 ? variant : auto;
  const place = (i: number) => {
    const d = (i - front + 3) % 3;
    if (d === 0) return { x: 130, y: 0, scale: 1, rotateY: 0, zIndex: 3, opacity: 1 };
    if (d === 1) return { x: 246, y: 24, scale: 0.8, rotateY: -24, zIndex: 1, opacity: 0.8 };
    return { x: 14, y: 24, scale: 0.8, rotateY: 24, zIndex: 1, opacity: 0.8 };
  };
  return (
    <>
      <div className="absolute inset-0" style={{ perspective: 1000 }}>
        {SITES.map((s, i) => (
          <motion.div key={s.label} className="absolute left-0 top-0" initial={false} animate={place(i)} transition={SPRING}>
            <MiniSite s={s} active={i === front} />
          </motion.div>
        ))}
      </div>
      <div className="absolute bottom-[14px] left-1/2 flex w-max -translate-x-1/2 gap-0.5 whitespace-nowrap rounded-[14px] bg-white/[0.08] p-1">
        {SITES.map((s, i) => (
          <span key={s.label} className="relative whitespace-nowrap rounded-[10px] px-3 py-[7px] font-display text-[11px] font-bold uppercase text-white">
            {i === front && <motion.span layoutId="tp-seg" className="absolute inset-0 rounded-[10px]" style={{ background: ACC, opacity: 0.9 }} transition={SPRING} />}
            <span className="relative">{s.label}</span>
          </span>
        ))}
      </div>
    </>
  );
}

function Concepts() {
  return (
    <Stage>
      <Head title="Три лица ^твоего^ *сайта*" sub="Листаю варианты — выбираешь ^один^" />
      <Body>
        <ConceptsFan once />
      </Body>
    </Stage>
  );
}

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="h-[330px] w-[170px] rounded-[36px] bg-[#0d0d10] p-[8px] shadow-[0_0_0_2px_#2c2c32,0_0_0_6px_#111,0_40px_80px_rgba(0,0,0,0.65)]">
      <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-gradient-to-b from-[#16121c] to-[#0c0c10] px-3 pb-3 pt-10">
        <span className="absolute left-1/2 top-2 h-5 w-[62px] -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  );
}

function Typed({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="inline-flex">
      {text.split("").map((ch, k) => (
        <motion.span key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + k * 0.07, duration: 0.01 }}>
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

function Lead() {
  return (
    <Stage>
      <Head title="Заявка ^в два^ *касания*" sub="Клиент оставил телефон — ^тебе пришло уведомление^" />
      <Body>
        <div className="absolute inset-0">
          <motion.div className="absolute left-[36px] top-[4px]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING}>
            <Phone>
              <div className="mb-3 h-[64px] rounded-[12px] p-2.5" style={{ background: ACC }}>
                <p className="font-display text-[12px] font-bold uppercase leading-[1] text-[#0b0b10]">
                  Твой
                  <br />
                  сайт
                </p>
              </div>
              {[
                { v: "Анна", d: 0.6 },
                { v: "+7 900 123-45-67", d: 1.1 },
              ].map((f) => (
                <div key={f.v} className="mb-2 flex h-9 items-center rounded-[10px] bg-white/[0.08] px-2.5 text-[13px] font-bold text-white ring-1 ring-white/10">
                  <Typed text={f.v} delay={f.d} />
                </div>
              ))}
              <motion.div
                className="mt-1.5 grid h-[38px] place-items-center rounded-full font-display text-[11px] font-bold uppercase text-[#0b0b10]"
                style={{ background: ACC }}
                animate={{ scale: [1, 1, 0.92, 1] }}
                transition={{ times: [0, 0.85, 0.92, 1], duration: 2.6 }}
              >
                Отправить
              </motion.div>
            </Phone>
          </motion.div>
          <motion.div
            className="absolute left-[200px] top-[18px] z-10 flex w-[250px] items-center gap-3 rounded-[18px] bg-[rgba(58,58,66,0.8)] px-3.5 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            initial={{ y: -30, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ ...SPRING, delay: 2.8 }}
          >
            <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] font-display text-[11px] font-bold text-[#0b0b10]" style={{ background: ACC }}>
              HD
            </span>
            <span className="font-display text-[13px] font-bold uppercase leading-tight text-white">
              Новая заявка
              <br />
              <span className="team-pulse-acc">Анна · сейчас</span>
            </span>
          </motion.div>
          <motion.div className="absolute left-[262px] top-[130px] w-[190px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}>
            <p className="font-display text-[40px] font-bold leading-none text-white">×2,4</p>
            <p className="mb-3 mt-1 font-display text-[11px] font-bold uppercase text-white">заявок за месяц</p>
            <div className="flex h-[110px] items-end gap-1.5">
              {[30, 38, 34, 52, 74, 100].map((h, k) => (
                <motion.i
                  key={k}
                  className="flex-1 rounded-[5px]"
                  style={{ background: k > 3 ? "linear-gradient(0deg, var(--sp-from), var(--sp-to))" : "rgba(255,255,255,.14)" }}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ ...SPRING, delay: 3.3 + k * 0.08 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </Body>
    </Stage>
  );
}

function Mug({ glaze = true }: { glaze?: boolean }) {
  return (
    <span className="relative block h-[86px] w-[92px]">
      <span className="absolute left-0 top-0 h-[86px] w-[68px] rounded-b-[22px] rounded-t-md shadow-[inset_-10px_0_18px_rgba(0,0,0,0.25)]" style={{ background: glaze ? ACC : "#8a8178" }} />
      <span className="absolute right-0 top-[18px] h-[42px] w-[34px] rounded-r-full border-[9px] border-l-0" style={{ borderColor: glaze ? "var(--sp-to)" : "#8a8178" }} />
    </span>
  );
}

function Catalog() {
  return (
    <Stage>
      <Head title="^Одна фотка^ → *карточка*" sub="Снимок с телефона превращается в *витрину*" />
      <Body>
        <div className="absolute inset-0">
          <motion.div className="absolute left-[22px] top-[44px]" initial={{ rotate: -10, opacity: 0, y: 20 }} animate={{ rotate: -5, opacity: 1, y: 0 }} transition={SPRING}>
            <div className="relative h-[220px] w-[150px] overflow-hidden rounded-2xl bg-[#3b3530] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_40%_30%,#6b5f55,#2a2522)]" />
              <span className="absolute left-[30px] top-[66px] opacity-80">
                <Mug glaze={false} />
              </span>
              <motion.span
                className="absolute inset-x-0 h-10"
                style={{ background: "linear-gradient(180deg, transparent, rgba(var(--tp-to-rgb),.6), transparent)" }}
                initial={{ top: -40 }}
                animate={{ top: 240 }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
              />
            </div>
            <p className="mt-3 text-center font-display text-[11px] font-bold uppercase text-white">Было</p>
          </motion.div>
          <motion.span className="absolute left-[190px] top-[140px] font-display text-[30px] font-bold" style={{ color: "var(--sp-to)" }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.6 }}>
            →
          </motion.span>
          <motion.div
            className="absolute left-[236px] top-[8px] w-[222px] overflow-hidden rounded-2xl bg-[#f5f2ec]"
            style={{ boxShadow: "0 30px 60px rgba(0,0,0,.6), 0 0 44px rgba(var(--tp-from-rgb),.35)" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...SPRING, delay: 1.9 }}
          >
            <div className="relative grid h-[180px] place-items-center bg-[radial-gradient(70%_70%_at_50%_40%,#fff,#e6dfd3)]">
              <motion.span initial={{ scale: 0.7, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...SPRING, delay: 2.2 }}>
                <Mug />
              </motion.span>
              <motion.span className="absolute left-3 top-3 rounded-full bg-[#111] px-2.5 py-1 font-display text-[10px] font-bold uppercase text-white" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6 }}>
                новинка
              </motion.span>
            </div>
            <motion.div className="p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }}>
              <p className="font-display text-[15px] font-bold uppercase text-[#161616]">Кружка «Утро»</p>
              <div className="mt-2 h-[7px] w-[80%] rounded-full bg-black/10" />
              <div className="mt-3 grid h-9 place-items-center rounded-full bg-[#111] font-display text-[11px] font-bold uppercase text-white">В корзину</div>
            </motion.div>
          </motion.div>
        </div>
      </Body>
    </Stage>
  );
}

function Rebrand() {
  const tick = useTick(2200);
  const after = tick >= 1;
  return (
    <Stage>
      <Head title="Было ^→^ *стало*" sub="Новый стиль ^сразу на сайте^, а не в презентации" />
      <Body>
        <div className="absolute left-1/2 top-0 flex w-max -translate-x-1/2 gap-0.5 rounded-[14px] bg-white/[0.08] p-1">
          {["Было", "Стало"].map((l, i) => (
            <span key={l} className="relative rounded-[10px] px-4 py-[7px] font-display text-[11px] font-bold uppercase text-white">
              {(i === 1) === after && <motion.span layoutId="tp-ba" className="absolute inset-0 rounded-[10px]" style={{ background: after ? ACC : "rgba(255,255,255,.18)" }} transition={SPRING} />}
              <span className="relative">{l}</span>
            </span>
          ))}
        </div>
        <motion.div
          className="absolute left-[40px] top-[52px] w-[400px] overflow-hidden rounded-[16px]"
          animate={{
            backgroundColor: after ? "#120d14" : "#e9e9e9",
            boxShadow: after
              ? "0 30px 70px rgba(0,0,0,.6), 0 0 0 1.5px rgba(var(--tp-to-rgb),.8), 0 0 50px rgba(var(--tp-from-rgb),.4)"
              : "0 24px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.1)",
          }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex h-[22px] items-center gap-[5px] px-[9px]" style={{ background: after ? "#1a141d" : "#d9d9d9" }}>
            <Dots light={!after} />
          </div>
          <div className="p-5">
            <motion.div className="flex items-center gap-2.5" key={String(after)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
              {after ? (
                <>
                  <span className="grid h-10 w-10 place-items-center rounded-[12px] font-display text-[18px] font-bold text-[#0b0b10]" style={{ background: ACC }}>
                    У
                  </span>
                  <span className="font-display text-[18px] font-bold uppercase tracking-[0.08em] text-white">Утро</span>
                </>
              ) : (
                <span className="font-serif text-[20px] text-[#555]">Кофейня Утро</span>
              )}
            </motion.div>
            <motion.div
              className="mt-4 flex h-[110px] items-end rounded-[12px] p-4"
              animate={{ background: after ? "linear-gradient(135deg, var(--sp-from), var(--sp-to))" : "linear-gradient(135deg, #cfcfcf, #bdbdbd)" }}
              transition={{ duration: 0.6 }}
            >
              <span className={`whitespace-pre-line text-[20px] font-bold leading-[1] ${after ? "font-display uppercase text-[#0b0b10]" : "font-serif text-[#666]"}`}>
                {after ? "Кофе, который\nбудит город" : "Добро пожаловать"}
              </span>
            </motion.div>
            <div className="mt-4 flex gap-1.5">
              {(after ? ["var(--sp-from)", "var(--sp-to)", "#f5f2ec", "#1a1a22"] : ["#8a8a8a", "#b0b0b0", "#cfcfcf"]).map((c, i) => (
                <motion.i key={`${after}-${i}`} className="h-6 w-10 rounded-[6px] ring-1 ring-white/15" style={{ background: c }} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING, delay: i * 0.08 }} />
              ))}
            </div>
          </div>
        </motion.div>
      </Body>
    </Stage>
  );
}


/* ── Сцены Егора: этапы, сроки, связь, команда ─────────────────────────── */

const SITE_STAGES = ["Бриф", "Концепция", "Сборка", "Правки", "Запуск"];

function Timeline({ stages: STAGES = SITE_STAGES, doneLabel = "Сайт запущен 🚀", title = "*Каждый этап* ^с твоего «ок»^", sub = "Дальше идём ^только после согласования^" }: { stages?: string[]; doneLabel?: string; title?: string; sub?: string } = {}) {
  const tick = useTick(950);
  const done = Math.min(tick, STAGES.length);
  return (
    <Stage>
      <Head title={title} sub={sub} />
      <Body>
        <div className="absolute left-[36px] right-[36px] top-[118px] h-[6px] rounded-full bg-white/10">
          <motion.div className="h-full rounded-full" style={{ background: ACC }} animate={{ width: `${(Math.max(0, done - 1) / (STAGES.length - 1)) * 100}%` }} transition={SPRING} />
        </div>
        {STAGES.map((st, i) => {
          const on = i < done;
          const x = 36 + (i * (480 - 72)) / (STAGES.length - 1);
          return (
            <div key={st} className="absolute top-[92px] flex -translate-x-1/2 flex-col items-center" style={{ left: x }}>
              <motion.span
                className="grid h-[58px] w-[58px] place-items-center rounded-full font-display text-[18px] font-bold"
                animate={{
                  scale: on ? 1 : 0.82,
                  background: on ? "linear-gradient(135deg, var(--sp-from), var(--sp-to))" : "rgba(255,255,255,0.08)",
                  color: on ? "#0b0b10" : "#fff",
                  boxShadow: on ? "0 0 26px rgba(var(--tp-from-rgb),.6)" : "inset 0 0 0 1px rgba(255,255,255,.2)",
                }}
                transition={SPRING}
              >
                {on ? "✓" : i + 1}
              </motion.span>
              <span className="mt-3 font-display text-[11px] font-bold uppercase text-white">{st}</span>
              <motion.span
                className="mt-2 rounded-full px-2.5 py-1 font-display text-[10px] font-bold uppercase text-[#0b0b10]"
                style={{ background: "linear-gradient(90deg,#ff6a3d,#ffc53d)" }}
                initial={false}
                animate={{ opacity: on ? 1 : 0, y: on ? 0 : -6 }}
                transition={SPRING}
              >
                ок
              </motion.span>
            </div>
          );
        })}
        <motion.div
          className="absolute bottom-[40px] left-1/2 rounded-full px-5 py-2.5 font-display text-[13px] font-bold uppercase text-[#0b0b10]"
          style={{ x: "-50%", background: ACC }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: done >= STAGES.length ? 1 : 0, scale: done >= STAGES.length ? 1 : 0.8 }}
          transition={SPRING}
        >
          {doneLabel}
        </motion.div>
      </Body>
    </Stage>
  );
}

function Calendar() {
  const bars = [
    { label: "Бриф", from: 0, len: 2, c: "linear-gradient(90deg,#ff6a3d,#ffc53d)" },
    { label: "Концепция", from: 2, len: 3, c: ACC },
    { label: "Сборка", from: 7, len: 5, c: ACC },
    { label: "Правки", from: 14, len: 3, c: "linear-gradient(90deg,#ff6a3d,#ffc53d)" },
  ];
  const cell = 56;
  return (
    <Stage>
      <Head title="Срок, ^который не плывёт^" sub="Этапы встают *по датам заранее*" />
      <Body>
        <div className="absolute left-[44px] top-[4px] grid grid-cols-7 gap-[4px]">
          {Array.from({ length: 21 }, (_, d) => (
            <div key={d} className="grid h-[52px] w-[52px] place-items-start rounded-[10px] bg-white/[0.05] p-1.5 font-display text-[11px] font-bold text-white ring-1 ring-white/10">
              {d + 1}
            </div>
          ))}
        </div>
        {bars.map((b, i) => {
          const row = Math.floor(b.from / 7);
          const col = b.from % 7;
          return (
            <motion.div
              key={b.label}
              className="absolute flex h-[22px] items-center rounded-full px-2.5 font-display text-[10px] font-bold uppercase text-[#0b0b10]"
              style={{ left: 44 + col * cell + 4, top: 4 + row * cell + 26, background: b.c, transformOrigin: "left center" }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: b.len * cell - 12, opacity: 1 }}
              transition={{ ...SPRING, delay: 0.3 + i * 0.6 }}
            >
              <span className="whitespace-nowrap">{b.label}</span>
            </motion.div>
          );
        })}
        <motion.div
          className="absolute flex items-center gap-2 rounded-full px-3.5 py-2 font-display text-[12px] font-bold uppercase text-[#0b0b10]"
          style={{ left: 44 + 3 * cell - 10, top: 4 + 2 * cell + 60, background: ACC, boxShadow: "0 0 26px rgba(var(--tp-from-rgb),.6)" }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING, delay: 3 }}
        >
          🚩 Запуск · 18-е · день в день
        </motion.div>
      </Body>
    </Stage>
  );
}

const SITE_MSGS = [
  { me: true, t: "Когда будет готово?" },
  { me: false, t: "В пятницу, как договорились ✓" },
  { me: true, t: "А можно ещё блок с отзывами?" },
  { me: false, t: "Да, передал Саше — покажу завтра" },
];

function Contact({ msgs = SITE_MSGS }: { msgs?: { me: boolean; t: string }[] } = {}) {
  return (
    <Stage>
      <Head title="*Один человек* ^на связи^" sub="Не нужно искать, ^кому написать^" />
      <Body>
        <div className="absolute left-[60px] top-[4px] w-[360px] rounded-[22px] bg-white/[0.05] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14),0_30px_60px_rgba(0,0,0,.45)]">
          <div className="mb-3 flex items-center gap-3">
            <img src={TEAM.egor.photo} alt="" className="h-10 w-10 rounded-full object-cover" style={{ boxShadow: "0 0 0 2px #0b0b10, 0 0 0 3.5px var(--sp-from)" }} />
            <span className="font-display text-[14px] font-bold uppercase text-white">
              Егор <span className="team-pulse-warm">· на связи</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {msgs.map((m, i) => (
              <motion.div
                key={m.t}
                className={`max-w-[80%] rounded-[16px] px-3.5 py-2.5 text-[14px] font-bold leading-snug text-white ${m.me ? "self-end rounded-br-md" : "self-start rounded-bl-md bg-white/[0.1]"}`}
                style={m.me ? { background: "linear-gradient(90deg, rgba(var(--tp-from-rgb),.45), rgba(var(--tp-to-rgb),.35))" } : undefined}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...SPRING, delay: 0.3 + i * 0.9 }}
              >
                {m.t}
              </motion.div>
            ))}
          </div>
        </div>
      </Body>
    </Stage>
  );
}

const SITE_CREW = [
  { m: TEAM.sasha, role: "Дизайн" },
  { m: TEAM.dima, role: "Моушн · AI" },
  { m: TEAM.max, role: "Идея · тексты" },
];

function TeamAssemble({ crew: people = SITE_CREW, center = "Твой сайт", title = "^Команда^ *под задачу*", sub = "Дизайн, моушн и тексты — ^в одном проекте^" }: { crew?: { m: (typeof TEAM)[string]; role: string }[]; center?: string; title?: string; sub?: string } = {}) {
  const spots = [
    { x: 90, y: 30 },
    { x: 390, y: 30 },
    { x: 240, y: 220 },
  ];
  const crew = people.map((c, i) => ({ ...c, ...spots[i] }));
  return (
    <Stage>
      <Head title={title} sub={sub} />
      <Body>
        <svg className="absolute inset-0" width="480" height="360" fill="none">
          {[
            [90, 80],
            [390, 80],
            [240, 270],
          ].map(([x, y], i) => (
            <motion.path key={i} d={`M 240 150 L ${x} ${y}`} stroke="url(#tp-line)" strokeWidth="2" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1 + i * 0.4 }} />
          ))}
          <defs>
            <linearGradient id="tp-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--sp-from)" />
              <stop offset="100%" stopColor="var(--sp-to)" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div
          className="absolute left-[160px] top-[112px] grid h-[76px] w-[160px] place-items-center rounded-[18px] font-display text-[14px] font-bold uppercase text-[#0b0b10]"
          style={{ background: ACC, boxShadow: "0 0 40px rgba(var(--tp-from-rgb),.55)" }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING}
        >
          {center}
        </motion.div>
        {crew.map((c, i) => (
          <motion.div
            key={c.m.id}
            className="absolute flex w-[120px] flex-col items-center"
            style={{ x: "-50%", left: c.x, top: c.y }}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.4 + i * 0.4 }}
          >
            <img src={c.m.photo} alt="" className="h-[64px] w-[64px] rounded-full object-cover" style={{ boxShadow: "0 0 0 3px #0b0b10, 0 0 0 5px var(--sp-from), 0 0 24px rgba(var(--tp-from-rgb),.5)" }} />
            <span className="mt-2 font-display text-[12px] font-bold uppercase text-white">{c.m.name}</span>
            <span className="team-pulse-warm font-display text-[10px] font-bold uppercase">{c.role}</span>
          </motion.div>
        ))}
      </Body>
    </Stage>
  );
}

/* ─── Егор на /ai ──────────────────────────────────────────────────────
   Та же «живая вёрстка», только про внедрение ИИ: пилот по шагам, было/
   стало по часам и деньгам, задача простыми словами → готовый результат,
   AI-команда вокруг проекта. Каждая сцена — один цикл, потом следующий
   тезис (правило Егора: у каждого тезиса своя графика со своим циклом). */

const AI_STEPS = ["Задача", "Пилот", "Твоё «ок»", "Масштаб"];

function AiPilot() {
  const tick = useTick(1000);
  const done = Math.min(tick, AI_STEPS.length);
  return (
    <Stage>
      <Head title="*Пилот* ^за неделю^" sub="Сначала пробуем ^на одной задаче^" />
      <Body>
        <div className="absolute left-[50px] right-[50px] top-[74px] h-[6px] rounded-full bg-white/10">
          <motion.div className="h-full rounded-full" style={{ background: ACC }} animate={{ width: `${(Math.max(0, done - 1) / (AI_STEPS.length - 1)) * 100}%` }} transition={SPRING} />
        </div>
        {AI_STEPS.map((st, i) => {
          const on = i < done;
          const x = 50 + (i * (480 - 100)) / (AI_STEPS.length - 1);
          return (
            <div key={st} className="absolute top-[46px] flex -translate-x-1/2 flex-col items-center" style={{ left: x }}>
              <motion.span
                className="grid h-[62px] w-[62px] place-items-center rounded-full font-display text-[20px] font-bold"
                animate={{
                  scale: on ? 1 : 0.82,
                  background: on ? "linear-gradient(135deg, var(--sp-from), var(--sp-to))" : "rgba(255,255,255,0.08)",
                  color: on ? "#0b0b10" : "#fff",
                  boxShadow: on ? "0 0 26px rgba(var(--tp-from-rgb),.6)" : "inset 0 0 0 1px rgba(255,255,255,.2)",
                }}
                transition={SPRING}
              >
                {on ? "✓" : i + 1}
              </motion.span>
              <span className="mt-3 whitespace-nowrap font-display text-[12px] font-bold uppercase text-white">{st}</span>
            </div>
          );
        })}
        <motion.div
          className="absolute left-[60px] right-[60px] top-[196px] flex items-center gap-4 rounded-[20px] bg-white/[0.05] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: done >= 2 ? 1 : 0, y: done >= 2 ? 0 : 14 }}
          transition={SPRING}
        >
          <span className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-[16px] text-[28px]" style={{ background: ACC }}>
            🎬
          </span>
          <div>
            <p className="font-display text-[15px] font-bold uppercase leading-tight text-white">
              Первые <span className="team-pulse-warm">10 роликов</span>
            </p>
            <p className="mt-1 font-display text-[11px] font-bold uppercase text-white">Смотришь результат — решаешь дальше</p>
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-[26px] left-1/2 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-[13px] font-bold uppercase text-[#0b0b10]"
          style={{ x: "-50%", background: ACC }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: done >= AI_STEPS.length ? 1 : 0, scale: done >= AI_STEPS.length ? 1 : 0.8 }}
          transition={SPRING}
        >
          ИИ в работе 🚀
        </motion.div>
      </Body>
    </Stage>
  );
}

function AiSavings() {
  const rows = [
    { label: "Часов на контент в неделю", was: 1, now: 0.28, wasT: "20 ч", nowT: "5 ч" },
    { label: "Бюджет на съёмку ролика", was: 1, now: 0.35, wasT: "Съёмка", nowT: "Генерация" },
    { label: "Ждать первый ролик", was: 1, now: 0.2, wasT: "Месяц", nowT: "Неделя" },
  ];
  return (
    <Stage>
      <Head title="*Было* ^→ стало^" sub="Считаю ^до старта^, сколько сэкономишь" />
      <Body>
        <div className="absolute left-[36px] right-[36px] top-[10px] flex flex-col gap-6">
          {rows.map((r, i) => (
            <div key={r.label}>
              <p className="mb-2 font-display text-[12px] font-bold uppercase text-white">{r.label}</p>
              <div className="relative h-[34px] rounded-[10px] bg-white/[0.06]">
                <motion.div
                  className="absolute inset-y-0 left-0 flex items-center justify-end rounded-[10px] bg-white/[0.16] pr-3 font-display text-[11px] font-bold uppercase text-white"
                  initial={{ width: "0%" }}
                  animate={{ width: `${r.was * 100}%` }}
                  transition={{ ...SPRING, delay: 0.2 + i * 0.35 }}
                >
                  {r.wasT}
                </motion.div>
                <motion.div
                  className="absolute inset-y-0 left-0 flex items-center justify-end whitespace-nowrap rounded-[10px] pr-3 font-display text-[11px] font-bold uppercase text-[#0b0b10]"
                  style={{ background: ACC, boxShadow: "0 0 22px rgba(var(--tp-from-rgb),.5)" }}
                  initial={{ width: "0%", opacity: 0 }}
                  animate={{ width: `${r.now * 100}%`, opacity: 1 }}
                  transition={{ ...SPRING, delay: 1.8 + i * 0.45 }}
                >
                  {r.nowT}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
        <motion.div
          className="absolute bottom-[26px] left-1/2 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-[13px] font-bold uppercase text-[#0b0b10]"
          style={{ x: "-50%", background: ACC }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 3.4 }}
        >
          Расчёт — за 15 минут созвона
        </motion.div>
      </Body>
    </Stage>
  );
}

function AiPrompts() {
  const tools = ["Видео", "Голос", "Аватар", "Тексты"];
  return (
    <Stage>
      <Head title="*Без своих* ^промптов^" sub="Ты говоришь задачу — ^дальше моя работа^" />
      <Body>
        <motion.div
          className="absolute left-[30px] top-[6px] max-w-[250px] rounded-[18px] rounded-bl-md px-4 py-3 text-[15px] font-bold leading-snug text-white"
          style={{ background: "linear-gradient(90deg, rgba(var(--tp-from-rgb),.45), rgba(var(--tp-to-rgb),.35))" }}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING, delay: 0.2 }}
        >
          Нужны ролики для кофейни на месяц ☕
        </motion.div>
        <motion.img
          src={TEAM.egor.photo}
          alt=""
          className="absolute left-[208px] top-[112px] h-[64px] w-[64px] rounded-full object-cover"
          style={{ boxShadow: "0 0 0 3px #0b0b10, 0 0 0 5px var(--sp-from), 0 0 30px rgba(var(--tp-from-rgb),.55)" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 1 }}
        />
        <div className="absolute inset-x-0 top-[200px] flex justify-center gap-2.5">
          {tools.map((t, i) => (
            <motion.span
              key={t}
              className="rounded-full bg-white/[0.08] px-3.5 py-2 font-display text-[11px] font-bold uppercase text-white ring-1 ring-white/15"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 1.7 + i * 0.25 }}
            >
              {t}
            </motion.span>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-[22px] flex justify-center gap-3">
          {[0, 1, 2, 3].map((k) => (
            <motion.span
              key={k}
              className="grid h-[82px] w-[52px] place-items-center rounded-[12px] text-[20px]"
              style={{ background: ACC, boxShadow: "0 0 20px rgba(var(--tp-from-rgb),.45)" }}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...SPRING, delay: 3 + k * 0.3 }}
            >
              ▶
            </motion.span>
          ))}
        </div>
      </Body>
    </Stage>
  );
}

function AiCrew() {
  const crew = [
    { m: TEAM.dima, role: "Генерации", x: 80, y: 40 },
    { m: TEAM.max, role: "Сценарий", x: 400, y: 40 },
    { m: TEAM.sasha, role: "Визуал", x: 240, y: 222 },
  ];
  return (
    <Stage>
      <Head title="^AI-команда^ *под задачу*" sub="Генерации, сценарий и визуал — ^в одном проекте^" />
      <Body>
        <svg className="absolute inset-0" width="480" height="360" fill="none">
          {[
            [112, 72],
            [368, 72],
            [240, 222],
          ].map(([x, y], i) => (
            <motion.path key={i} d={`M 240 146 L ${x} ${y}`} stroke="url(#tp-ai-line)" strokeWidth="2" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1 + i * 0.4 }} />
          ))}
          <defs>
            <linearGradient id="tp-ai-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--sp-from)" />
              <stop offset="100%" stopColor="var(--sp-to)" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div
          className="absolute left-[165px] top-[108px] grid h-[76px] w-[150px] place-items-center rounded-[18px] text-center font-display text-[14px] font-bold uppercase leading-tight text-[#0b0b10]"
          style={{ background: ACC, boxShadow: "0 0 40px rgba(var(--tp-from-rgb),.55)" }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING}
        >
          Твой AI-продакшн
        </motion.div>
        {crew.map((c, i) => (
          <motion.div
            key={c.m.id}
            className="absolute flex w-[120px] flex-col items-center"
            style={{ x: "-50%", left: c.x, top: c.y }}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.4 + i * 0.4 }}
          >
            <img src={c.m.photo} alt="" className="h-[64px] w-[64px] rounded-full object-cover" style={{ boxShadow: "0 0 0 3px #0b0b10, 0 0 0 5px var(--sp-from), 0 0 24px rgba(var(--tp-from-rgb),.5)" }} />
            <span className="mt-2 font-display text-[12px] font-bold uppercase text-white">{c.m.name}</span>
            <span className="team-pulse-warm whitespace-nowrap font-display text-[10px] font-bold uppercase">{c.role}</span>
          </motion.div>
        ))}
      </Body>
    </Stage>
  );
}

/* ─── /content: Егор (продакшн по шагам) и Макс (идея и сценарий) ──── */

const SHOOT_STAGES = ["Бриф", "Сценарий", "Съёмка", "Монтаж", "Сдача"];
const SHOOT_MSGS = [
  { me: true, t: "Когда будет ролик?" },
  { me: false, t: "Монтаж в четверг, в пятницу у тебя ✓" },
  { me: true, t: "А можно версию для рилсов?" },
  { me: false, t: "Да, передал Вадиму — нарежет 9:16" },
];
const SHOOT_CREW = [
  { m: TEAM.max, role: "Идея · сценарий" },
  { m: TEAM.dima, role: "Монтаж · AI" },
  { m: TEAM.sasha, role: "Графика" },
];

function MaxHooks() {
  const hooks = ["«Ты тоже так делаешь?»", "«3 секунды — и ты купишь»", "«Никто не говорит об этом»"];
  const tick = useTick(1100);
  const pick = tick >= 3 ? 1 : -1;
  return (
    <Stage>
      <Head title="*Цепляем* ^за 3 секунды^" sub="Три крючка на выбор — ^берём сильный^" />
      <Body>
        <div className="absolute inset-x-[40px] top-[10px] flex flex-col gap-4">
          {hooks.map((h, i) => (
            <motion.div
              key={h}
              className="flex items-center gap-4 rounded-[18px] px-5 py-4"
              initial={{ opacity: 0, x: -24 }}
              animate={{
                opacity: pick >= 0 && pick !== i ? 0.35 : i < tick + 1 ? 1 : 0,
                x: 0,
                scale: pick === i ? 1.05 : 1,
                background: pick === i ? "linear-gradient(135deg, var(--sp-from), var(--sp-to))" : "rgba(255,255,255,0.06)",
              }}
              transition={SPRING}
            >
              <span className={`font-display text-[26px] font-bold ${pick === i ? "text-[#0b0b10]" : "team-pulse-acc"}`}>{i + 1}</span>
              <span className={`font-display text-[15px] font-bold uppercase ${pick === i ? "text-[#0b0b10]" : "text-white"}`}>{h}</span>
              {pick === i && <span className="ml-auto font-display text-[18px] font-bold text-[#0b0b10]">✓</span>}
            </motion.div>
          ))}
        </div>
        <motion.div
          className="absolute bottom-[26px] left-1/2 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-[13px] font-bold uppercase text-[#0b0b10]"
          style={{ x: "-50%", background: ACC }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: pick >= 0 ? 1 : 0, scale: pick >= 0 ? 1 : 0.8 }}
          transition={SPRING}
        >
          Досматривают до конца 🔥
        </motion.div>
      </Body>
    </Stage>
  );
}

function MaxStoryboard() {
  const frames = [
    { e: "☕", t: "Утро" },
    { e: "📦", t: "Продукт" },
    { e: "😮", t: "Вау" },
    { e: "🛒", t: "Покупка" },
  ];
  return (
    <Stage>
      <Head title="*Раскадровка* ^до съёмки^" sub="Видишь ролик ^кадр за кадром^ заранее" />
      <Body>
        <div className="absolute inset-x-[30px] top-[20px] grid grid-cols-2 gap-4">
          {frames.map((f, i) => (
            <motion.div
              key={f.t}
              className="relative h-[120px] overflow-hidden rounded-[16px] bg-white/[0.05] shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING, delay: 0.3 + i * 0.7 }}
            >
              <motion.div
                className="absolute inset-0 grid place-items-center text-[44px]"
                style={{ background: "linear-gradient(135deg, rgba(var(--tp-from-rgb),.35), rgba(var(--tp-to-rgb),.25))" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.7 }}
              >
                {f.e}
              </motion.div>
              <span className="absolute left-3 top-2 font-display text-[12px] font-bold uppercase text-white">Кадр {i + 1}</span>
              <span className="absolute bottom-2 left-3 font-display text-[12px] font-bold uppercase text-white">{f.t}</span>
            </motion.div>
          ))}
        </div>
      </Body>
    </Stage>
  );
}

function MaxConcepts() {
  const cards = [
    { t: "Смешно", e: "😂", r: -8, x: 60 },
    { t: "Дорого", e: "✨", r: 0, x: 170 },
    { t: "Честно", e: "🤝", r: 8, x: 280 },
  ];
  const tick = useTick(1400);
  const pick = tick >= 2 ? 1 : -1;
  return (
    <Stage>
      <Head title="*2–3 концепции* ^бесплатно^" sub="Выбираешь идею ^до договора^" />
      <Body>
        {cards.map((c, i) => (
          <motion.div
            key={c.t}
            className="absolute top-[40px] flex h-[200px] w-[140px] flex-col items-center justify-center gap-3 rounded-[20px]"
            style={{ left: c.x }}
            initial={{ opacity: 0, y: 40, rotate: 0 }}
            animate={{
              opacity: pick >= 0 && pick !== i ? 0.35 : 1,
              y: pick === i ? -10 : 0,
              rotate: pick === i ? 0 : c.r,
              scale: pick === i ? 1.1 : 1,
              background: pick === i ? "linear-gradient(135deg, var(--sp-from), var(--sp-to))" : "rgba(255,255,255,0.07)",
            }}
            transition={{ ...SPRING, delay: pick >= 0 ? 0 : 0.3 + i * 0.35 }}
          >
            <span className="text-[44px]">{c.e}</span>
            <span className={`font-display text-[15px] font-bold uppercase ${pick === i ? "text-[#0b0b10]" : "text-white"}`}>{c.t}</span>
          </motion.div>
        ))}
        <motion.div
          className="absolute bottom-[26px] left-1/2 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-[13px] font-bold uppercase text-[#0b0b10]"
          style={{ x: "-50%", background: ACC }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: pick >= 0 ? 1 : 0, scale: pick >= 0 ? 1 : 0.8 }}
          transition={SPRING}
        >
          Идея выбрана ✓
        </motion.div>
      </Body>
    </Stage>
  );
}

function MaxCreative() {
  const lines = ["Не «ролик про продукт»,", "а история, которую", "досматривают и пересылают"];
  return (
    <Stage>
      <Head title="*Идея* ^важнее бюджета^" sub="Сильный сценарий ^вытягивает любой формат^" />
      <Body>
        <div className="absolute left-[50px] right-[50px] top-[20px] rounded-[22px] bg-white/[0.05] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]">
          {lines.map((l, i) => (
            <motion.p
              key={l}
              className={`font-display text-[20px] font-bold uppercase leading-tight ${i === 2 ? "team-pulse-acc" : "text-white"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.3 + i * 0.6 }}
            >
              {l}
            </motion.p>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-[30px] flex justify-center gap-6">
          {[
            { v: "×3", t: "досмотры" },
            { v: "×2", t: "репосты" },
          ].map((m, i) => (
            <motion.div
              key={m.t}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING, delay: 2.4 + i * 0.4 }}
            >
              <span className="team-pulse-warm font-display text-[40px] font-bold leading-none">{m.v}</span>
              <span className="mt-1 font-display text-[12px] font-bold uppercase text-white">{m.t}</span>
            </motion.div>
          ))}
        </div>
      </Body>
    </Stage>
  );
}

/* ─── Вадим на /ai: генерации, форматы, аватар, подбор модели ────────── */

function DimaPhotoToVideo() {
  const tick = useTick(900);
  const phase = Math.min(tick, 4); // 0 фото · 1 скан · 2 кадры · 3 видео · 4 готово
  return (
    <Stage>
      <Head title="*Одна фотка* ^→ ролик^" sub="Съёмочный день ^не нужен^" />
      <Body>
        <motion.div
          className="absolute left-[40px] top-[30px] h-[200px] w-[150px] overflow-hidden rounded-[18px] bg-[#f5f2ec] shadow-[0_20px_40px_rgba(0,0,0,.45)]"
          animate={{ rotate: phase >= 2 ? -6 : 0, scale: phase >= 2 ? 0.9 : 1 }}
          transition={SPRING}
        >
          <div className="grid h-full place-items-center text-[64px]">🧴</div>
          <motion.i
            className="absolute inset-x-0 h-[4px]"
            style={{ background: ACC, boxShadow: "0 0 18px rgba(var(--tp-from-rgb),.9)" }}
            initial={{ top: 0, opacity: 0 }}
            animate={phase === 1 ? { top: ["0%", "100%"], opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.9, ease: "linear" }}
          />
          <span className="absolute bottom-2 left-3 font-display text-[11px] font-bold uppercase text-black/70">Фото</span>
        </motion.div>
        <motion.span
          className="team-pulse-acc absolute left-[212px] top-[112px] font-display text-[40px] font-bold"
          animate={{ opacity: phase >= 1 ? 1 : 0.2, x: phase >= 1 ? 6 : 0 }}
          transition={SPRING}
        >
          →
        </motion.span>
        <motion.div
          className="absolute right-[40px] top-[20px] h-[230px] w-[140px] overflow-hidden rounded-[22px] bg-[#0b0b10] shadow-[inset_0_0_0_2px_rgba(255,255,255,.2),0_20px_40px_rgba(0,0,0,.5)]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: phase >= 2 ? 1 : 0, x: phase >= 2 ? 0 : 20 }}
          transition={SPRING}
        >
          <motion.div
            className="absolute inset-0 grid place-items-center text-[60px]"
            style={{ background: "linear-gradient(160deg, rgba(var(--tp-from-rgb),.55), rgba(var(--tp-to-rgb),.55))" }}
            animate={{ scale: phase >= 3 ? [1, 1.12, 1] : 1, rotate: phase >= 3 ? [0, 8, -4, 0] : 0 }}
            transition={{ duration: 2.4, repeat: phase >= 3 ? Infinity : 0 }}
          >
            🧴
          </motion.div>
          <span className="absolute left-3 top-2 font-display text-[11px] font-bold uppercase text-white">Reels · 9:16</span>
          <div className="absolute inset-x-3 bottom-3 h-[5px] rounded-full bg-white/20">
            <motion.div className="h-full rounded-full bg-white" animate={{ width: phase >= 3 ? "100%" : "0%" }} transition={{ duration: 1.8, ease: "linear" }} />
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-[26px] left-1/2 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-[13px] font-bold uppercase text-[#0b0b10]"
          style={{ x: "-50%", background: ACC }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: phase >= 4 ? 1 : 0, scale: phase >= 4 ? 1 : 0.8 }}
          transition={SPRING}
        >
          Ролик готов за вечер ✓
        </motion.div>
      </Body>
    </Stage>
  );
}

function DimaFormats() {
  const out = [
    { t: "Reels", r: "9:16", w: 78, h: 138, x: 30 },
    { t: "Лента", r: "1:1", w: 110, h: 110, x: 140 },
    { t: "YouTube", r: "16:9", w: 176, h: 99, x: 272 },
  ];
  return (
    <Stage>
      <Head title="*Один ролик* ^→ все площадки^" sub="Нарезаю под каждую ^без пересъёмки^" />
      <Body>
        <motion.div
          className="absolute left-1/2 top-[6px] flex h-[70px] w-[200px] items-center justify-center gap-2 rounded-[14px] font-display text-[13px] font-bold uppercase text-[#0b0b10]"
          style={{ x: "-50%", background: ACC, boxShadow: "0 0 30px rgba(var(--tp-from-rgb),.5)" }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING}
        >
          ▶ Твой ролик
        </motion.div>
        {out.map((f, i) => (
          <motion.div
            key={f.t}
            className="absolute flex flex-col items-center"
            style={{ left: f.x, top: 120 }}
            initial={{ opacity: 0, y: -60, scale: 0.4 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING, delay: 0.9 + i * 0.6 }}
          >
            <div className="grid place-items-center rounded-[12px] bg-white/[0.07] text-[22px] shadow-[inset_0_0_0_2px_rgba(var(--tp-to-rgb),.7)]" style={{ width: f.w, height: f.h }}>
              ▶
            </div>
            <span className="mt-2 font-display text-[12px] font-bold uppercase text-white">{f.t}</span>
            <span className="team-pulse-warm font-display text-[11px] font-bold uppercase">{f.r}</span>
          </motion.div>
        ))}
      </Body>
    </Stage>
  );
}

function DimaAvatar() {
  const langs = ["RU", "EN", "KZ", "ES"];
  const tick = useTick(1000);
  const lang = tick % langs.length;
  const lines = ["Привет! Я ведущий вашего бренда", "Hi! I host your brand", "Сәлем! Мен брендтің жүргізушісімін", "¡Hola! Presento tu marca"];
  return (
    <Stage>
      <Head title="*AI-аватар* ^вместо съёмок^" sub="Говорит за тебя ^на любом языке^" />
      <Body>
        <div className="absolute left-1/2 top-[6px] -translate-x-1/2">
          <motion.div
            className="grid h-[120px] w-[120px] place-items-center rounded-full text-[64px]"
            style={{ background: ACC, boxShadow: "0 0 40px rgba(var(--tp-from-rgb),.55)" }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🧑‍💼
          </motion.div>
        </div>
        <div className="absolute left-1/2 top-[140px] flex h-[40px] -translate-x-1/2 items-center gap-[5px]">
          {Array.from({ length: 16 }, (_, k) => (
            <motion.i
              key={k}
              className="w-[6px] rounded-full"
              style={{ background: ACC }}
              animate={{ height: [8, 12 + ((k * 7) % 26), 8] }}
              transition={{ duration: 0.6 + (k % 4) * 0.15, repeat: Infinity, delay: k * 0.05 }}
            />
          ))}
        </div>
        <motion.p
          key={lang}
          className="absolute inset-x-[30px] top-[196px] text-center text-[16px] font-bold text-white"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
        >
          «{lines[lang]}»
        </motion.p>
        <div className="absolute inset-x-0 bottom-[24px] flex justify-center gap-2.5">
          {langs.map((l, i) => (
            <motion.span
              key={l}
              className="rounded-full px-3.5 py-1.5 font-display text-[12px] font-bold"
              animate={{
                background: i === lang ? "linear-gradient(135deg, var(--sp-from), var(--sp-to))" : "rgba(255,255,255,0.08)",
                color: i === lang ? "#0b0b10" : "#fff",
                scale: i === lang ? 1.1 : 1,
              }}
              transition={SPRING}
            >
              {l}
            </motion.span>
          ))}
        </div>
      </Body>
    </Stage>
  );
}

function DimaModels() {
  const models = [
    { e: "🎬", t: "Видео" },
    { e: "🎙", t: "Голос" },
    { e: "🖼", t: "Картинка" },
    { e: "🎵", t: "Музыка" },
    { e: "✍️", t: "Тексты" },
    { e: "🧑‍💼", t: "Аватар" },
  ];
  const tick = useTick(450);
  const done = tick >= 8;
  const cur = done ? 0 : tick % models.length;
  return (
    <Stage>
      <Head title="*Подбираю модель* ^под задачу^" sub="Не для галочки — ^под твой результат^" />
      <Body>
        <div className="absolute inset-x-[50px] top-[10px] grid grid-cols-3 gap-3">
          {models.map((m, i) => (
            <motion.div
              key={m.t}
              className="flex h-[92px] flex-col items-center justify-center gap-1.5 rounded-[16px]"
              animate={{
                background: i === cur ? "linear-gradient(135deg, var(--sp-from), var(--sp-to))" : "rgba(255,255,255,0.06)",
                scale: i === cur ? 1.06 : 1,
                opacity: done && i !== cur ? 0.35 : 1,
              }}
              transition={{ duration: 0.25 }}
            >
              <span className="text-[30px]">{m.e}</span>
              <span className={`font-display text-[12px] font-bold uppercase ${i === cur ? "text-[#0b0b10]" : "text-white"}`}>{m.t}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="absolute bottom-[26px] left-1/2 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-[13px] font-bold uppercase text-[#0b0b10]"
          style={{ x: "-50%", background: ACC }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.8 }}
          transition={SPRING}
        >
          Подобрано: видео-модель ✓
        </motion.div>
      </Body>
    </Stage>
  );
}

function ChatDimaFormat({ chosen }: { chosen?: number }) {
  const frame = (w: number, h: number) => <i className="block rounded-[8px]" style={{ width: w, height: h, background: ACC }} />;
  return (
    <ChatTiles
      chosen={chosen}
      w={150}
      title="*Под какую* ^площадку^^?^"
      sub="Сразу нарежу ^в нужный формат^"
      tiles={[
        { label: "Reels · 9:16", art: frame(34, 60) },
        { label: "Лента · 1:1", art: frame(52, 52) },
        { label: "YouTube · 16:9", art: frame(72, 40) },
      ]}
    />
  );
}

/* ─── /smm: Таня (ведение соцсетей) и Егор (этапы ведения) ─────────── */

const SMM_STAGES = ["Аудит", "Стратегия", "Контент", "Таргет", "Отчёт"];
const SMM_MSGS = [
  { me: true, t: "Что выходит на этой неделе?" },
  { me: false, t: "3 рилса и 2 карусели, план уже у тебя ✓" },
  { me: true, t: "А можно ролик про новинку?" },
  { me: false, t: "Да, передал Тане — снимем в четверг" },
];
const SMM_CREW = [
  { m: TEAM.tanya, role: "Ведение · таргет" },
  { m: TEAM.dima, role: "Монтаж рилсов" },
  { m: TEAM.max, role: "Сценарии" },
];

function TanyaGrid() {
  const tick = useTick(420);
  const filled = Math.min(tick, 9);
  const tiles = ["🎬", "☕", "✨", "📦", "😍", "🎬", "🔥", "💬", "🎬"];
  const followers = 1200 + filled * 380;
  return (
    <Stage>
      <Head title="*Профиль,* ^который растёт^" sub="Каждый пост — ^в одном стиле и по плану^" />
      <Body>
        <div className="absolute left-[40px] top-[6px] flex items-center gap-3">
          <span className="grid h-[52px] w-[52px] place-items-center rounded-full text-[24px]" style={{ background: ACC }}>
            ☕
          </span>
          <div>
            <p className="font-display text-[14px] font-bold uppercase text-white">твой_бренд</p>
            <p className="font-display text-[12px] font-bold uppercase text-white">
              <span className="team-pulse-acc text-[16px]">{followers.toLocaleString("ru-RU")}</span> подписчиков
            </p>
          </div>
        </div>
        <div className="absolute left-[40px] top-[74px] grid grid-cols-3 gap-[6px]">
          {tiles.map((t, i) => (
            <motion.div
              key={i}
              className="grid h-[84px] w-[128px] place-items-center rounded-[10px] text-[28px]"
              animate={{
                background: i < filled ? "linear-gradient(135deg, rgba(var(--tp-from-rgb),.55), rgba(var(--tp-to-rgb),.45))" : "rgba(255,255,255,0.05)",
                scale: i === filled - 1 ? [0.8, 1.06, 1] : 1,
              }}
              transition={{ duration: 0.4 }}
            >
              {i < filled ? t : ""}
            </motion.div>
          ))}
        </div>
      </Body>
    </Stage>
  );
}

function TanyaReach() {
  const tick = useTick(500);
  const views = Math.min(tick * 3100, 24800);
  const hearts = Array.from({ length: 8 }, (_, k) => k);
  return (
    <Stage>
      <Head title="*Рилсы,* ^которые смотрят^" sub="Охват растёт ^без покупки подписчиков^" />
      <Body>
        <div className="absolute left-[60px] top-[10px] h-[260px] w-[150px] overflow-hidden rounded-[22px] shadow-[inset_0_0_0_2px_rgba(255,255,255,.2)]" style={{ background: "linear-gradient(160deg, rgba(var(--tp-from-rgb),.5), rgba(var(--tp-to-rgb),.5))" }}>
          <div className="grid h-full place-items-center text-[56px]">🎬</div>
          <span className="absolute bottom-3 left-3 font-display text-[12px] font-bold uppercase text-white">▶ {views.toLocaleString("ru-RU")}</span>
          {hearts.map((k) => (
            <motion.span
              key={k}
              className="absolute right-3 text-[20px]"
              initial={{ bottom: 20, opacity: 0 }}
              animate={{ bottom: [20, 240], opacity: [0, 1, 0], x: [0, k % 2 ? -14 : 10, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: k * 0.35 }}
            >
              ❤️
            </motion.span>
          ))}
        </div>
        <div className="absolute right-[50px] top-[20px] flex w-[190px] flex-col gap-4">
          {[
            { t: "Просмотры", v: "×5" },
            { t: "Сохранения", v: "×3" },
            { t: "Заявки в директ", v: "+40%" },
          ].map((m, i) => (
            <motion.div
              key={m.t}
              className="rounded-[16px] bg-white/[0.06] px-4 py-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.8 + i * 0.7 }}
            >
              <p className="team-pulse-acc font-display text-[28px] font-bold leading-none">{m.v}</p>
              <p className="mt-1 font-display text-[11px] font-bold uppercase text-white">{m.t}</p>
            </motion.div>
          ))}
        </div>
      </Body>
    </Stage>
  );
}

function TanyaPlan() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const kinds = { reel: { i: "▶", t: "Рилс" }, story: { i: "◐", t: "Сторис" }, carousel: { i: "▦", t: "Карусель" }, live: { i: "●", t: "Эфир" } } as const;
  const posts: { d: number; k: keyof typeof kinds }[] = [
    { d: 0, k: "reel" },
    { d: 1, k: "story" },
    { d: 2, k: "carousel" },
    { d: 3, k: "reel" },
    { d: 4, k: "story" },
    { d: 5, k: "reel" },
    { d: 6, k: "live" },
  ];
  const col = (436 - 36) / 7;
  return (
    <Stage>
      <Head title="*Контент-план* ^на месяц^" sub="Знаешь заранее, ^что и когда выйдет^" />
      <Body>
        <div className="absolute inset-x-[22px] top-[10px] grid grid-cols-7 gap-[6px]">
          {days.map((d) => (
            <div key={d} className="flex h-[180px] flex-col items-center rounded-[12px] bg-white/[0.05] pt-2 ring-1 ring-white/10">
              <span className="font-display text-[12px] font-bold uppercase text-white">{d}</span>
            </div>
          ))}
        </div>
        {posts.map((p, i) => (
          <motion.span
            key={i}
            className="absolute grid h-[44px] place-items-center rounded-[12px] text-[20px] font-bold text-[#0b0b10]"
            style={{ left: 22 + p.d * (col + 6) + 4, width: col - 8, background: ACC, boxShadow: "0 0 16px rgba(var(--tp-from-rgb),.45)" }}
            initial={{ top: -40, opacity: 0 }}
            animate={{ top: 50 + (i % 2) * 60, opacity: 1 }}
            transition={{ ...SPRING, delay: 0.3 + i * 0.35 }}
          >
            {kinds[p.k].i}
          </motion.span>
        ))}
        <div className="absolute inset-x-0 top-[204px] flex justify-center gap-4">
          {Object.values(kinds).map((k) => (
            <span key={k.t} className="flex items-center gap-1.5 font-display text-[11px] font-bold uppercase text-white">
              <span className="team-pulse-acc text-[14px]">{k.i}</span>
              {k.t}
            </span>
          ))}
        </div>
        <motion.div
          className="absolute bottom-[28px] left-1/2 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-[13px] font-bold uppercase text-[#0b0b10]"
          style={{ x: "-50%", background: ACC }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 3.2 }}
        >
          План согласован ✓
        </motion.div>
      </Body>
    </Stage>
  );
}

function TanyaReport() {
  const bars = [
    { t: "Охват", was: 0.3, now: 0.85 },
    { t: "Подписчики", was: 0.35, now: 0.7 },
    { t: "Заявки", was: 0.2, now: 0.62 },
  ];
  return (
    <Stage>
      <Head title="*Отчёт* ^каждый месяц^" sub="Видишь в цифрах, ^что сработало^" />
      <Body>
        <div className="absolute inset-x-[40px] top-[10px] rounded-[20px] bg-white/[0.05] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]">
          <p className="mb-4 font-display text-[13px] font-bold uppercase text-white">
            Отчёт · <span className="team-pulse-warm">сентябрь</span>
          </p>
          <div className="flex h-[170px] items-end justify-around">
            {bars.map((b, i) => (
              <div key={b.t} className="flex flex-col items-center">
                <div className="flex h-[140px] items-end gap-2">
                  <motion.i className="block w-[26px] rounded-t-[8px] bg-white/20" initial={{ height: 0 }} animate={{ height: b.was * 140 }} transition={{ ...SPRING, delay: 0.3 + i * 0.2 }} />
                  <motion.i className="block w-[26px] rounded-t-[8px]" style={{ background: ACC, boxShadow: "0 0 18px rgba(var(--tp-from-rgb),.5)" }} initial={{ height: 0 }} animate={{ height: b.now * 140 }} transition={{ ...SPRING, delay: 1.4 + i * 0.35 }} />
                </div>
                <span className="mt-2 font-display text-[11px] font-bold uppercase text-white">{b.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-[22px] flex justify-center gap-5 font-display text-[11px] font-bold uppercase text-white">
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-white/20" /> было</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm" style={{ background: ACC }} /> стало</span>
        </div>
      </Body>
    </Stage>
  );
}

function ChatSmmWhat({ chosen }: { chosen?: number }) {
  return (
    <ChatTiles
      chosen={chosen}
      w={180}
      title="*Что* ^берём на себя^^?^"
      sub="Скажи, ^что сейчас болит больше всего^"
      tiles={[
        { label: "Ведение целиком", art: <Glyph>▦</Glyph> },
        { label: "Рилсы", art: <Glyph>▶</Glyph> },
        { label: "Таргет", art: <Glyph>◎</Glyph> },
        { label: "Аудит профиля", art: <Glyph>🔍</Glyph> },
      ]}
    />
  );
}

function ChatSmmNow({ chosen }: { chosen?: number }) {
  return (
    <ChatTiles
      chosen={chosen}
      w={150}
      title="*Как* ^сейчас^^?^"
      sub="От этого зависит, ^с чего начнём^"
      tiles={[
        { label: "Аккаунта нет", art: <Glyph>＋</Glyph> },
        { label: "Веду сам", art: <Glyph>✋</Glyph> },
        { label: "Есть SMM, не растёт", art: <Glyph>↘</Glyph> },
      ]}
    />
  );
}

export default function TeamPulseScenes({ scene }: { scene: TeamPulseScene }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      key={scene}
      className="absolute inset-0"
      initial={reduced ? false : { opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {scene === "concepts" && <Concepts />}
      {scene === "lead" && <Lead />}
      {scene === "catalog" && <Catalog />}
      {scene === "rebrand" && <Rebrand />}
      {scene === "timeline" && <Timeline />}
      {scene === "calendar" && <Calendar />}
      {scene === "contact" && <Contact />}
      {scene === "team" && <TeamAssemble />}
      {scene === "aiPilot" && <AiPilot />}
      {scene === "aiSavings" && <AiSavings />}
      {scene === "aiPrompts" && <AiPrompts />}
      {scene === "aiCrew" && <AiCrew />}
      {scene === "contentTimeline" && <Timeline stages={SHOOT_STAGES} doneLabel="Ролик у тебя 🎬" />}
      {scene === "contentContact" && <Contact msgs={SHOOT_MSGS} />}
      {scene === "contentCrew" && <TeamAssemble crew={SHOOT_CREW} center="Твой ролик" title="^Команда^ *под ролик*" sub="Сценарий, монтаж и графика — ^в одном проекте^" />}
      {scene === "maxHooks" && <MaxHooks />}
      {scene === "maxStoryboard" && <MaxStoryboard />}
      {scene === "maxConcepts" && <MaxConcepts />}
      {scene === "maxCreative" && <MaxCreative />}
      {scene === "dimaPhotoToVideo" && <DimaPhotoToVideo />}
      {scene === "dimaFormats" && <DimaFormats />}
      {scene === "dimaAvatar" && <DimaAvatar />}
      {scene === "dimaModels" && <DimaModels />}
      {scene === "smmTimeline" && <Timeline stages={SMM_STAGES} doneLabel="Соцсети растут 📈" />}
      {scene === "smmContact" && <Contact msgs={SMM_MSGS} />}
      {scene === "smmCrew" && <TeamAssemble crew={SMM_CREW} center="Твои соцсети" title="^Команда^ *под соцсети*" sub="Ведение, рилсы и сценарии — ^в одном договоре^" />}
      {scene === "tanyaGrid" && <TanyaGrid />}
      {scene === "tanyaReach" && <TanyaReach />}
      {scene === "tanyaPlan" && <TanyaPlan />}
      {scene === "tanyaReport" && <TanyaReport />}
    </motion.div>
  );
}

/* ═══ Сцены чата: варианты ответа на текущий вопрос ═════════════════════ */

/** Плитка варианта. Пока ответа нет, подсветка сама проходит по плиткам —
 *  «вот из чего выбираем»; после ответа остаётся на выбранной, остальные
 *  гаснут. */
function Tile({ label, lit, dim, w, children }: { label: string; lit: boolean; dim: boolean; w: number; children: ReactNode }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      style={{ width: w }}
      animate={{ scale: lit ? 1.06 : 1, opacity: dim ? 0.35 : 1 }}
      transition={SPRING}
    >
      <div
        className="relative grid h-[104px] w-full place-items-center overflow-hidden rounded-[18px] bg-white/[0.05]"
        style={{
          boxShadow: lit
            ? "0 0 0 1.5px rgba(var(--tp-to-rgb),.95), 0 0 34px rgba(var(--tp-from-rgb),.5), 0 20px 40px rgba(0,0,0,.45)"
            : "inset 0 0 0 1px rgba(255,255,255,.14), 0 16px 30px rgba(0,0,0,.35)",
        }}
      >
        {children}
      </div>
      <span className={`text-center font-display text-[11px] font-bold uppercase leading-tight ${lit ? "team-pulse-acc" : "text-white"}`}>{label}</span>
    </motion.div>
  );
}

function useLit(count: number, chosen?: number) {
  const tick = useTick(1100, chosen === undefined);
  return chosen !== undefined && chosen >= 0 ? chosen : tick % count;
}

const Browser = ({ children, w = 96, light = false }: { children?: ReactNode; w?: number; light?: boolean }) => (
  <div className="overflow-hidden rounded-[9px]" style={{ width: w, background: light ? "#f5f2ec" : "#101118", boxShadow: "0 0 0 1px rgba(255,255,255,.14)" }}>
    <div className="flex h-[14px] items-center gap-[3px] px-[6px]" style={{ background: light ? "#e7e2d8" : "#1a1c24" }}>
      {[0, 1, 2].map((d) => (
        <i key={d} className="h-[4px] w-[4px] rounded-full bg-[rgba(127,127,127,.6)]" />
      ))}
    </div>
    <div className="p-[7px]">{children}</div>
  </div>
);

function ChatWhat({ chosen }: { chosen?: number }) {
  const lit = useLit(5, chosen);
  const pickedAll = chosen !== undefined && chosen >= 0;
  const tiles: { label: string; art: ReactNode }[] = [
    {
      label: "Новый сайт",
      art: (
        <Browser>
          <div className="grid h-[44px] place-items-center rounded-[6px] bg-white/[0.06]">
            <span className="grid h-7 w-7 place-items-center rounded-full font-display text-[18px] font-bold text-[#0b0b10]" style={{ background: ACC }}>+</span>
          </div>
        </Browser>
      ),
    },
    {
      label: "Редизайн",
      art: (
        <div className="flex items-center gap-1.5">
          <div className="h-[46px] w-[38px] rounded-[7px] bg-white/25" />
          <span className="font-display text-[16px] font-bold" style={{ color: "var(--sp-to)" }}>→</span>
          <div className="h-[46px] w-[38px] rounded-[7px]" style={{ background: ACC }} />
        </div>
      ),
    },
    {
      label: "Ребрендинг",
      art: (
        <div className="flex flex-col items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-[12px] font-display text-[17px] font-bold text-[#0b0b10]" style={{ background: ACC }}>У</span>
          <span className="flex gap-1">
            {["var(--sp-from)", "var(--sp-to)", "#f5f2ec"].map((c) => (
              <i key={c} className="h-3 w-5 rounded-[3px]" style={{ background: c }} />
            ))}
          </span>
        </div>
      ),
    },
    {
      label: "Каталог",
      art: (
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="grid h-[34px] w-[38px] place-items-center rounded-[7px] bg-[#f5f2ec]">
              <i className="h-4 w-4 rounded-[4px]" style={{ background: ACC }} />
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Пока не знаю",
      art: <span className="team-pulse-acc font-display text-[44px] font-bold leading-none">?</span>,
    },
  ];
  return (
    <Stage>
      <Head title="Что *собираем*^?^" sub="Выбери вариант — ^покажу, как это будет выглядеть^" />
      <Body>
        <div className="absolute inset-x-6 top-[10px] flex flex-wrap justify-center gap-x-4 gap-y-5">
          {tiles.map((t, i) => (
            <Tile key={t.label} label={t.label} lit={i === lit} dim={pickedAll && i !== lit} w={128}>
              {t.art}
            </Tile>
          ))}
        </div>
      </Body>
    </Stage>
  );
}

function ChatRef({ chosen }: { chosen?: number }) {
  const tick = useTick(3000, chosen === undefined);
  return (
    <Stage>
      <Head title="Твой ^референс^" sub="Скинь сайт, который нравится, — *я пойму стиль*" />
      <Body>
        <div className="absolute left-[40px] top-[10px] w-[400px] overflow-hidden rounded-[16px] bg-[#101118] shadow-[0_30px_60px_rgba(0,0,0,.55),0_0_0_1px_rgba(255,255,255,.14)]">
          <div className="flex h-[30px] items-center gap-[5px] bg-[#1a1c24] px-3">
            <Dots />
            <span className="ml-3 flex h-[18px] flex-1 items-center rounded-full bg-white/[0.08] px-3 font-display text-[10px] font-bold uppercase text-white">
              {chosen === 0 ? <span className="team-pulse-acc">твой-любимый-сайт.ru</span> : ""}
            </span>
          </div>
          <div className="relative m-4 grid h-[200px] place-items-center rounded-[14px]" style={{ boxShadow: "inset 0 0 0 2px rgba(var(--tp-to-rgb),.55)", borderRadius: 14 }}>
            {chosen === 1 ? (
              <motion.div className="flex flex-col items-center gap-3" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}>
                <span className="team-pulse-acc font-display text-[46px] font-bold leading-none">✦</span>
                <span className="font-display text-[15px] font-bold uppercase text-white">Саша подберёт стиль сама</span>
              </motion.div>
            ) : (
              <>
                <span className="font-display text-[14px] font-bold uppercase text-white">Перетащи скрин сюда</span>
                <motion.div
                  key={tick}
                  className="absolute h-[92px] w-[128px] overflow-hidden rounded-[10px]"
                  style={{ boxShadow: "0 20px 40px rgba(0,0,0,.5), 0 0 0 1.5px rgba(var(--tp-from-rgb),.8)" }}
                  initial={{ x: 180, y: -120, rotate: 12, opacity: 0 }}
                  animate={{ x: 0, y: 0, rotate: -4, opacity: 1 }}
                  transition={{ ...SPRING, delay: 0.4 }}
                >
                  <div className="h-full w-full p-2" style={{ background: "#f5f2ec" }}>
                    <div className="h-[46px] rounded-[6px]" style={{ background: "linear-gradient(160deg, #e3d8c6, #b7a37f)" }} />
                    <div className="mt-2 h-[6px] w-[70%] rounded-full bg-black/15" />
                    <div className="mt-1.5 h-[12px] w-[50px] rounded-full bg-[#111]" />
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </Body>
    </Stage>
  );
}

function ChatMood({ chosen }: { chosen?: number }) {
  return (
    <Stage>
      <Head title="Какое *настроение*^?^" sub="^Смело^, премиум или *свежо* — жми вариант справа" />
      <Body>
        <ConceptsFan variant={chosen !== undefined && chosen >= 0 && chosen < 3 ? chosen : undefined} />
      </Body>
    </Stage>
  );
}

function ChatGoal({ chosen }: { chosen?: number }) {
  const lit = useLit(4, chosen);
  const picked = chosen !== undefined && chosen >= 0;
  const tiles: { label: string; art: ReactNode }[] = [
    {
      label: "Собирать заявки",
      art: (
        <div className="flex w-[84px] flex-col gap-1.5">
          <i className="h-[12px] rounded-[4px] bg-white/20" />
          <i className="h-[12px] rounded-[4px] bg-white/20" />
          <i className="h-[16px] rounded-full" style={{ background: ACC }} />
        </div>
      ),
    },
    {
      label: "Продавать товары",
      art: (
        <div className="flex items-end gap-2">
          <div className="grid h-[52px] w-[40px] place-items-center rounded-[8px] bg-[#f5f2ec]">
            <i className="h-5 w-5 rounded-[5px]" style={{ background: ACC }} />
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full font-display text-[16px] font-bold text-[#0b0b10]" style={{ background: ACC }}>
            ₽
          </span>
        </div>
      ),
    },
    {
      label: "Показывать работы",
      art: (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <i key={k} className="h-[26px] w-[28px] rounded-[5px]" style={{ background: k % 2 ? "rgba(255,255,255,.2)" : ACC }} />
          ))}
        </div>
      ),
    },
    { label: "Другое", art: <span className="team-pulse-acc font-display text-[40px] font-bold leading-none">…</span> },
  ];
  return (
    <Stage>
      <Head title="Главная ^задача^ *сайта*" sub="От этого зависит ^первый экран^" />
      <Body>
        <div className="absolute inset-x-10 top-[10px] grid grid-cols-2 gap-x-6 gap-y-5">
          {tiles.map((t, i) => (
            <Tile key={t.label} label={t.label} lit={i === lit} dim={picked && i !== lit} w={180}>
              {t.art}
            </Tile>
          ))}
        </div>
      </Body>
    </Stage>
  );
}

function ChatSpeed({
  chosen,
  rows = [
    { label: "Нужно вчера", fill: 0.95, time: "Рывок" },
    { label: "За пару недель", fill: 0.62, time: "Ровно" },
    { label: "Не горит", fill: 0.35, time: "Спокойно" },
  ],
  title = "^Скорость^ запуска",
  sub = "Подстроим план под *твой срок*",
}: {
  chosen?: number;
  rows?: { label: string; fill: number; time: string }[];
  title?: string;
  sub?: string;
}) {
  const lit = useLit(rows.length, chosen);
  const picked = chosen !== undefined && chosen >= 0;
  return (
    <Stage>
      <Head title={title} sub={sub} />
      <Body>
        <div className="absolute inset-x-8 top-[20px] flex flex-col gap-5">
          {rows.map((r, i) => (
            <motion.div
              key={r.label}
              className="rounded-[16px] bg-white/[0.05] px-5 py-4"
              animate={{ scale: i === lit ? 1.03 : 1, opacity: picked && i !== lit ? 0.35 : 1 }}
              transition={SPRING}
              style={{
                boxShadow:
                  i === lit
                    ? "0 0 0 1.5px rgba(var(--tp-to-rgb),.95), 0 0 30px rgba(var(--tp-from-rgb),.45)"
                    : "inset 0 0 0 1px rgba(255,255,255,.14)",
              }}
            >
              <div className="flex items-baseline justify-between">
                <span className={`font-display text-[15px] font-bold uppercase ${i === lit ? "team-pulse-acc" : "text-white"}`}>{r.label}</span>
                <span className="font-display text-[11px] font-bold uppercase text-white">{r.time}</span>
              </div>
              <div className="mt-3 h-[10px] overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full" style={{ background: ACC }} initial={{ width: 0 }} animate={{ width: `${r.fill * 100}%` }} transition={{ duration: 1.2 - i * 0.2, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }} />
              </div>
            </motion.div>
          ))}
        </div>
      </Body>
    </Stage>
  );
}


function ChatTiles({ chosen, title, sub, tiles, w = 128 }: { chosen?: number; title: string; sub: string; tiles: { label: string; art: ReactNode }[]; w?: number }) {
  const lit = useLit(tiles.length, chosen);
  const picked = chosen !== undefined && chosen >= 0;
  return (
    <Stage>
      <Head title={title} sub={sub} />
      <Body>
        <div className="absolute inset-x-6 top-[10px] flex flex-wrap justify-center gap-x-4 gap-y-5">
          {tiles.map((t, i) => (
            <Tile key={t.label} label={t.label} lit={i === lit} dim={picked && i !== lit} w={w}>
              {t.art}
            </Tile>
          ))}
        </div>
      </Body>
    </Stage>
  );
}

const Glyph = ({ children }: { children: ReactNode }) => (
  <span className="grid h-14 w-14 place-items-center rounded-[16px] font-display text-[24px] font-bold text-[#0b0b10]" style={{ background: ACC }}>
    {children}
  </span>
);

function ChatStage({ chosen }: { chosen?: number }) {
  return (
    <ChatTiles
      chosen={chosen}
      w={180}
      title="~На каком~ *ты этапе*^?^"
      sub="От этого зависит, ^с какого шага начнём^"
      tiles={[
        { label: "Только идея", art: <Glyph>✦</Glyph> },
        {
          label: "Есть ТЗ",
          art: (
            <div className="flex w-[70px] flex-col gap-1.5 rounded-[10px] bg-[#f5f2ec] p-2.5">
              {[90, 70, 80, 50].map((w, k) => (
                <i key={k} className="h-[6px] rounded-full bg-black/25" style={{ width: `${w}%` }} />
              ))}
            </div>
          ),
        },
        {
          label: "Есть сайт, нужно лучше",
          art: (
            <Browser>
              <div className="h-[34px] rounded-[6px]" style={{ background: ACC }} />
            </Browser>
          ),
        },
        { label: "Горит запуск", art: <Glyph>🔥</Glyph> },
      ]}
    />
  );
}

function ChatApprover({ chosen }: { chosen?: number }) {
  const dot = (k: number) => <i key={k} className="h-9 w-9 rounded-full ring-2 ring-[#0b0b10]" style={{ background: k % 2 ? "var(--sp-to)" : "var(--sp-from)" }} />;
  return (
    <ChatTiles
      chosen={chosen}
      title="*Кто* ^согласует^^?^"
      sub="Подстрою этапы под того, *кто решает*"
      tiles={[
        { label: "Я сам", art: <span className="flex">{dot(0)}</span> },
        { label: "Команда", art: <span className="flex -space-x-3">{[0, 1, 2].map(dot)}</span> },
        { label: "Пока не знаю", art: <span className="team-pulse-acc font-display text-[44px] font-bold leading-none">?</span> },
      ]}
    />
  );
}

function ChatChannel({ chosen }: { chosen?: number }) {
  return (
    <ChatTiles
      chosen={chosen}
      title="*Как держим* ^связь^^?^"
      sub="Где тебе удобнее — ^там и на связи^"
      tiles={[
        {
          label: "Telegram",
          art: (
            <span className="grid h-14 w-14 place-items-center rounded-full text-[#0b0b10]" style={{ background: ACC }}>
              <TelegramIcon className="h-6 w-6" />
            </span>
          ),
        },
        { label: "Созвоны", art: <Glyph>☎</Glyph> },
        { label: "Почта", art: <Glyph>@</Glyph> },
      ]}
    />
  );
}

function ChatAiTask({ chosen }: { chosen?: number }) {
  return (
    <ChatTiles
      chosen={chosen}
      w={180}
      title="*Что* ^отдаём ИИ^^?^"
      sub="Начнём с того, что ^съедает больше всего времени^"
      tiles={[
        { label: "Ролики и рилсы", art: <Glyph>▶</Glyph> },
        { label: "AI-аватар", art: <Glyph>☺</Glyph> },
        { label: "Соцсети целиком", art: <Glyph>#</Glyph> },
        { label: "Пока не знаю", art: <span className="team-pulse-acc font-display text-[44px] font-bold leading-none">?</span> },
      ]}
    />
  );
}

function ChatShootWhat({ chosen }: { chosen?: number }) {
  return (
    <ChatTiles
      chosen={chosen}
      w={180}
      title="*Что* ^снимаем^^?^"
      sub="От формата зависит ^команда и сроки^"
      tiles={[
        { label: "Рекламный ролик", art: <Glyph>▶</Glyph> },
        { label: "Рилсы и шортсы", art: <Glyph>↕</Glyph> },
        { label: "Имиджевый фильм", art: <Glyph>✦</Glyph> },
        { label: "Мероприятие", art: <Glyph>★</Glyph> },
      ]}
    />
  );
}

function ChatShootGoal({ chosen }: { chosen?: number }) {
  return (
    <ChatTiles
      chosen={chosen}
      w={150}
      title="*Зачем* ^ролик^^?^"
      sub="Под цель ^придумаю крючок^"
      tiles={[
        { label: "Продажи", art: <Glyph>₽</Glyph> },
        { label: "Узнаваемость", art: <Glyph>◎</Glyph> },
        { label: "Запуск продукта", art: <Glyph>🚀</Glyph> },
      ]}
    />
  );
}

function ChatShootTone({ chosen }: { chosen?: number }) {
  return (
    <ChatTiles
      chosen={chosen}
      w={150}
      title="*Какое* ^настроение^^?^"
      sub="Подача, в которой ^тебя узнают^"
      tiles={[
        { label: "Смешно", art: <Glyph>😂</Glyph> },
        { label: "Дорого", art: <Glyph>✨</Glyph> },
        { label: "Честно", art: <Glyph>🤝</Glyph> },
        { label: "Дерзко", art: <Glyph>⚡</Glyph> },
      ]}
    />
  );
}

function ChatBrief({ answers, done, who }: { answers: string[]; done: boolean; who: string }) {
  return (
    <Stage>
      <Head title={done ? `Заявка ^у ${who}^` : "*Бриф* ^собран^"} sub={done ? "Напишу ^в течение дня^ — можно продолжить в мессенджере" : "Выбирай: ^полный бриф^ или *сразу заказ*"} />
      <Body>
        <div className="absolute left-[50px] top-[6px] w-[380px] rounded-[20px] bg-white/[0.05] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.14),0_30px_60px_rgba(0,0,0,.45)]">
          <div className="flex flex-col gap-2.5">
            {answers.map((a, i) => (
              <motion.div key={a + i} className="flex items-center gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: 0.1 + i * 0.12 }}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-[12px] font-bold text-[#0b0b10]" style={{ background: ACC }}>
                  ✓
                </span>
                <span className="font-display text-[14px] font-bold uppercase text-white">{a}</span>
              </motion.div>
            ))}
          </div>
          {done && (
            <motion.div className="mt-5 grid h-12 place-items-center rounded-full font-display text-[13px] font-bold uppercase text-[#0b0b10]" style={{ background: ACC }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING, delay: 0.6 }}>
              Отправлено ✓
            </motion.div>
          )}
        </div>
      </Body>
    </Stage>
  );
}

export function TeamPulseChatScene({
  visual,
  chosen,
  phase,
  answers,
  who,
}: {
  visual?: TeamPulseChatVisual;
  chosen?: number;
  phase: string;
  answers: string[];
  /** Родительный падеж имени: «Заявка у Егора». */
  who: string;
}) {
  const reduced = useReducedMotion();
  const key = phase === "brief" ? visual : phase === "done" ? "done" : "brief";
  return (
    <motion.div
      key={key}
      className="absolute inset-0"
      initial={reduced ? false : { opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {phase === "brief" ? (
        <>
          {visual === "what" && <ChatWhat chosen={chosen} />}
          {visual === "ref" && <ChatRef chosen={chosen} />}
          {visual === "mood" && <ChatMood chosen={chosen} />}
          {visual === "goal" && <ChatGoal chosen={chosen} />}
          {visual === "speed" && <ChatSpeed chosen={chosen} />}
          {visual === "stage" && <ChatStage chosen={chosen} />}
          {visual === "deadline" && (
            <ChatSpeed
              chosen={chosen}
              title="*Сколько* ^до запуска^^?^"
              sub="Под твой срок ^распишу этапы по датам^"
              rows={[
                { label: "Неделя", fill: 0.95, time: "Рывок" },
                { label: "Месяц", fill: 0.62, time: "Ровно" },
                { label: "Не спешу", fill: 0.35, time: "Спокойно" },
              ]}
            />
          )}
          {visual === "approver" && <ChatApprover chosen={chosen} />}
          {visual === "channel" && <ChatChannel chosen={chosen} />}
          {visual === "aiTask" && <ChatAiTask chosen={chosen} />}
          {visual === "shootWhat" && <ChatShootWhat chosen={chosen} />}
          {visual === "shootGoal" && <ChatShootGoal chosen={chosen} />}
          {visual === "shootTone" && <ChatShootTone chosen={chosen} />}
          {visual === "dimaFormat" && <ChatDimaFormat chosen={chosen} />}
          {visual === "smmWhat" && <ChatSmmWhat chosen={chosen} />}
          {visual === "smmNow" && <ChatSmmNow chosen={chosen} />}
          {visual === "aiVolume" && (
            <ChatSpeed
              chosen={chosen}
              title="*Сколько* ^контента^ нужно^?^"
              sub="Под объём ^посчитаю экономию^"
              rows={[
                { label: "Пара роликов", fill: 0.3, time: "Пилот" },
                { label: "Каждую неделю", fill: 0.62, time: "Поток" },
                { label: "Каждый день", fill: 0.95, time: "Завод" },
              ]}
            />
          )}
        </>
      ) : (
        <ChatBrief answers={answers} done={phase === "done"} who={who} />
      )}
    </motion.div>
  );
}
