"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TeamPulseChatVisual, TeamPulseScene } from "./types";
import { marks } from "./marks";

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

function ConceptsFan({ variant }: { variant?: number }) {
  const tick = useTick(1900, variant === undefined || variant < 0);
  const front = variant !== undefined && variant >= 0 ? variant : tick % 3;
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
        <ConceptsFan />
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
  const tick = useTick(5200);
  return (
    <Stage>
      <Head title="Заявка ^в два^ *касания*" sub="Клиент оставил телефон — ^тебе пришло уведомление^" />
      <Body>
        <div key={tick} className="absolute inset-0">
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
  const tick = useTick(5200);
  return (
    <Stage>
      <Head title="^Одна фотка^ → *карточка*" sub="Снимок с телефона превращается в *витрину*" />
      <Body>
        <div key={tick} className="absolute inset-0">
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
  const tick = useTick(2600);
  const after = tick % 2 === 1;
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

function ChatSpeed({ chosen }: { chosen?: number }) {
  const lit = useLit(3, chosen);
  const picked = chosen !== undefined && chosen >= 0;
  const rows = [
    { label: "Нужно вчера", fill: 0.95, time: "Рывок" },
    { label: "За пару недель", fill: 0.62, time: "Ровно" },
    { label: "Не горит", fill: 0.35, time: "Спокойно" },
  ];
  return (
    <Stage>
      <Head title="^Скорость^ запуска" sub="Подстроим план под *твой срок*" />
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

function ChatBrief({ answers, done }: { answers: string[]; done: boolean }) {
  return (
    <Stage>
      <Head title={done ? "Заявка ^у Саши^" : "*Бриф* ^собран^"} sub={done ? "Напишу ^в течение дня^ — можно продолжить в мессенджере" : "Выбирай: ^полный бриф^ или *сразу заказ*"} />
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
}: {
  visual?: TeamPulseChatVisual;
  chosen?: number;
  phase: string;
  answers: string[];
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
        </>
      ) : (
        <ChatBrief answers={answers} done={phase === "done"} />
      )}
    </motion.div>
  );
}
