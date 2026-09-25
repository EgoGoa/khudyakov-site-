// Звук сайта — один движок на всё: звуки интерфейса, окружение сцен и музыка.
//
// Три шины под общим мастером:
//   ui     — звуки кнопок, каруселей, окошек. Синтезируются прямо тут через
//            Web Audio (файлов нет вовсе): короткие «тюк», тики и шорохи.
//   scene  — окружение ролика на /content, /ai, /sites, /smm (птицы, мотор,
//            вечеринка). Нарочно очень тихо — Егор просил, чтобы оно почти
//            сливалось с фоном, а интерфейс звучал заметно громче.
//   music  — станция настроений. Включается отдельно и только по желанию.
//
// Браузер не даёт сайту звучать до первого клика/тапа/клавиши. Поэтому
// «звук сайта» включён по умолчанию, но оживает с первого жеста: до него
// движок только запоминает, какая сцена сейчас на экране, и заводит её,
// как только звук разрешён.
//
// Сцена живёт по главам кинематографической колоды: глава открылась — петля
// окружения плавно нарастает, пока играет отрезок ролика; ролик замер —
// петля не обрывается, а уходит в очень тихий фон и крутится, пока человек
// в этой главе; следующая глава — петли перетекают одна в другую.

export type MoodId = "focus" | "confident" | "jazzhop" | "nightdrive" | "tokyo" | "classic";

export type Mood = {
  id: MoodId;
  label: string;
  genre: string;
  /** Треки настроения, по кругу. Пустой список — «скоро». */
  tracks: string[];
};

// Треки — Pixabay (Pixabay Content License, можно на сайт без указания
// автора), подобраны под референсы Егора. Лежат на своём домене в
// public/audio/music, выровнены по громкости к −16 LUFS, 128 кбит/с.
// Грузятся только когда человек сам включил музыку (preload="none").
const M = (f: string) => `/audio/music/${f}.mp3`;

// Названия — только настроения, в одном ключе (Егор: «фокус, расслабление,
// драйв…»), жанр идёт мелкой подписью справа.
export const MOODS: Mood[] = [
  // leberch — Deep Concentration; alex-morgan — Focus Music
  { id: "focus", label: "Фокус", genre: "deep flow", tracks: [M("focus-1"), M("focus-2")] },
  // NickPanek — Mocking; MoonpetalMedia — Moonshine & Magnolia
  { id: "confident", label: "Уверенность", genre: "тёмный блюз", tracks: [M("confident-1"), M("confident-2")] },
  // VibeCroft — Jazzy Boom Bap Hip-Hop; Rockot — Luxurious Layer
  { id: "jazzhop", label: "Расслабление", genre: "джаз-хипхоп", tracks: [M("jazzhop-1"), M("jazzhop-2")] },
  // AlexGrohl — Night Drive; 9JackJack8 — City Lights
  { id: "nightdrive", label: "Драйв", genre: "дип-хаус", tracks: [M("nightdrive-1"), M("nightdrive-2")] },
  // vjgalaxy — Dark Melodic Techno 01, Melodic Techno 04
  { id: "tokyo", label: "Энергия", genre: "техно", tracks: [M("tokyo-1"), M("tokyo-2")] },
  // JuliusH — String Adagio; FluxSound — Soft Cinematic Strings
  { id: "classic", label: "Вдохновение", genre: "классика", tracks: [M("classic-1"), M("classic-2")] },
];

export type UiSound = "hover" | "click" | "open" | "close" | "swipe" | "chapter" | "windows" | "toggle";

type Shot = { file: string; at: number; gain?: number };
/** motion — петля звучит только пока движется кадр: на замершем кадре
 *  почти глохнет (мотор машины, которая остановилась). */
type Scene = { loop?: string; shots?: Shot[]; motion?: boolean };

const S = (f: string) => `/audio/scenes/${f}.mp3`;

// Звук окружения по главам каждой страницы. Порядок — порядок глав
// (PHASES на странице), подобран по тому, что происходит в кадре.
const SCENES: Record<string, Scene[]> = {
  // /content — первая страница: окружения нет вовсе, только звуки
  // интерфейса (Егор: синтетический «воздух студии» звучал странно, сцены
  // начинаются со второй страницы).
  // вилла в джунглях → закат на балконе → гараж
  ai: [
    { loop: S("ai-jungle-day") },
    { loop: S("ai-jungle-day"), shots: [{ file: S("laptop-typing"), at: 0.6, gain: 0.35 }] },
    { loop: S("ai-jungle-day") },
    { loop: S("ai-jungle-day") },
    { loop: S("ai-jungle-day"), shots: [{ file: S("laptop-typing"), at: 0.3, gain: 0.35 }] },
    { loop: S("evening-cicadas") },
    { loop: S("evening-cicadas") },
    { loop: S("evening-cicadas"), shots: [{ file: S("garage-car-start"), at: 1.2 }] },
  ],
  // посадка в машину, дорога, гепард, ночная вилла, приезд. Мотор —
  // спортивный оппозитник, и он живёт вместе с кадром: машина едет —
  // мотор слышен, кадр замер — мотор уходит почти в тишину (motion).
  sites: [
    { loop: S("sports-car-cruise"), motion: true, shots: [{ file: S("sports-car-start"), at: 0.1, gain: 0.8 }] },
    { loop: S("sports-car-cruise"), motion: true },
    { loop: S("sports-car-cruise"), motion: true, shots: [{ file: S("sports-car-flyby"), at: 0.6, gain: 0.8 }] },
    { loop: S("sports-car-cruise"), motion: true },
    { loop: S("evening-cicadas") },
    { loop: S("evening-cicadas"), shots: [{ file: S("car-door"), at: 0.6 }] },
  ],
  // ночная терраса → вечеринка → бассейн и звездопад → танцы → рассвет
  smm: [
    { loop: S("evening-cicadas") },
    { loop: S("party-crowd"), shots: [{ file: S("glass-clink"), at: 1.5 }] },
    { loop: S("party-crowd"), shots: [{ file: S("glass-clink"), at: 2.2, gain: 0.8 }] },
    { loop: S("evening-cicadas") },
    { loop: S("party-crowd") },
    { loop: S("evening-cicadas") },
  ],
};

// «Дистанция» окружения на каждой странице: насколько звук приглушён
// (срез верхов) и сколько в нём эха. Егор: на /sites вечер — звуки должны
// идти издалека, с эхом, «не в лоб»; птицы — только на /ai.
const DISTANCE: Record<string, { cutoff: number; echo: number }> = {
  ai: { cutoff: 6500, echo: 0.18 },
  sites: { cutoff: 1700, echo: 0.55 },
  smm: { cutoff: 2600, echo: 0.4 },
};

// Громкости. Файлы окружения нормализованы к −20 LUFS, так что эти числа
// означают одно и то же для любого из них.
// Егор после первого прослушивания: «навязчиво и грубо» — всё тише.
const LEVEL = {
  ui: 0.3,
  scenePlay: 0.09, // пока играет отрезок ролика
  sceneHold: 0.035, // ролик замер — еле слышный фон
  motionHold: 0.012, // мотор на замершем кадре
  shot: 0.14, // разовые звуки сцены (мотор, бокалы)
  music: 0.55,
};
const FADE_IN = 1.6;
const FADE_TO_HOLD = 2.8;
const FADE_OUT = 1.4;

type Settings = { sfx: boolean; music: boolean; mood: MoodId; volume: number };
const KEY = "hdkv-sound-v1";
const DEFAULTS: Settings = { sfx: true, music: false, mood: "focus", volume: 0.8 };

function readSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      sfx: parsed.sfx ?? DEFAULTS.sfx,
      // Музыка не заводится сама на новом заходе — только по кнопке.
      music: false,
      mood: MOODS.some((m) => m.id === parsed.mood) ? (parsed.mood as MoodId) : DEFAULTS.mood,
      volume: typeof parsed.volume === "number" ? Math.min(1, Math.max(0, parsed.volume)) : DEFAULTS.volume,
    };
  } catch {
    return DEFAULTS;
  }
}

type Loop = { key: string; src: AudioBufferSourceNode; gain: GainNode };

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private ui!: GainNode;
  private scene!: GainNode;
  private sceneTone!: BiquadFilterNode;
  private sceneEcho!: GainNode;
  private space!: ConvolverNode;
  private musicBus!: GainNode;
  private analyser: AnalyserNode | null = null;
  private freq: Uint8Array<ArrayBuffer> | null = null;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private loop: Loop | null = null;
  private shotTimers: number[] = [];
  private sceneWanted: { page: string; index: number; hold: boolean } | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private trackIndex = 0;
  private listeners = new Set<() => void>();
  private lastHover = 0;
  settings: Settings = DEFAULTS;
  unlocked = false;
  musicPlaying = false;

  init() {
    this.settings = readSettings();
    const unlock = () => {
      this.unlock();
      if (this.unlocked) {
        window.removeEventListener("pointerdown", unlock, true);
        window.removeEventListener("keydown", unlock, true);
        window.removeEventListener("touchend", unlock, true);
      }
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    window.addEventListener("touchend", unlock, true);
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else if (this.settings.sfx || this.musicPlaying) void this.ctx.resume();
    });
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(this.settings));
    } catch {
      /* приватный режим — просто не запоминаем */
    }
    this.listeners.forEach((fn) => fn());
  }

  private unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.settings.volume;
      this.master.connect(this.ctx.destination);
      this.ui = this.bus(LEVEL.ui);
      this.makeSpace();
      // Окружение: шина → срез верхов (дистанция) → мастер, плюс отправка
      // в общее «пространство» — чем больше, тем дальше звучит источник.
      this.scene = this.ctx.createGain();
      this.sceneTone = this.ctx.createBiquadFilter();
      this.sceneTone.type = "lowpass";
      this.sceneTone.frequency.value = 6500;
      this.sceneTone.Q.value = 0.5;
      this.scene.connect(this.sceneTone).connect(this.master);
      this.sceneEcho = this.ctx.createGain();
      this.sceneEcho.gain.value = 0;
      this.sceneTone.connect(this.sceneEcho);
      this.sceneEcho.connect(this.space);
      this.musicBus = this.bus(LEVEL.music);
      // Анализатор на музыкальной шине — по нему дорожка в шапке пульсирует
      // в такт настоящему треку, а не по заготовленной анимации.
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.72;
      this.musicBus.connect(this.analyser);
      this.freq = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
    }
    if (this.ctx.state !== "running") void this.ctx.resume();
    if (this.unlocked) return;
    this.unlocked = true;
    // Сцена, которая уже на экране, заводится с первого жеста.
    const w = this.sceneWanted;
    if (w && this.settings.sfx) this.startScene(w.page, w.index, w.hold);
    this.emit();
  }

  private bus(level: number) {
    const g = this.ctx!.createGain();
    g.gain.value = level;
    g.connect(this.master);
    return g;
  }

  private load(url: string): Promise<AudioBuffer | null> {
    const ctx = this.ctx;
    if (!ctx) return Promise.resolve(null);
    let p = this.buffers.get(url);
    if (!p) {
      p = fetch(url)
        .then((r) => r.arrayBuffer())
        .then((b) => ctx.decodeAudioData(b))
        .catch(() => null);
      this.buffers.set(url, p);
    }
    return p;
  }

  // ─── Сцены ────────────────────────────────────────────────────────────

  /** Глава колоды открылась: окружение нарастает и звучит, пока играет ролик. */
  enterChapter(page: string, index: number) {
    this.sceneWanted = { page, index, hold: false };
    if (this.canSfx()) this.startScene(page, index, false);
  }

  /** Ролик замер на последнем кадре главы: окружение уходит в тихий фон. */
  holdChapter() {
    if (this.sceneWanted) this.sceneWanted.hold = true;
    if (!this.loop || !this.ctx) return;
    this.ramp(this.loop.gain, this.holdLevel(), FADE_TO_HOLD);
  }

  /** Колода ушла с экрана или со страницы — окружение затихает. */
  leaveStage() {
    this.sceneWanted = null;
    this.clearShots();
    this.stopLoop();
  }

  private holdLevel() {
    const w = this.sceneWanted;
    return w && SCENES[w.page]?.[w.index]?.motion ? LEVEL.motionHold : LEVEL.sceneHold;
  }

  private canSfx() {
    return this.unlocked && this.settings.sfx && !!this.ctx;
  }

  private startScene(page: string, index: number, hold: boolean) {
    const scene = SCENES[page]?.[index];
    this.clearShots();
    if (!scene) {
      this.stopLoop();
      return;
    }
    const target = hold ? this.holdLevel() : LEVEL.scenePlay;
    const dist = DISTANCE[page];
    if (dist && this.ctx) {
      const now = this.ctx.currentTime;
      this.sceneTone.frequency.setTargetAtTime(dist.cutoff, now, 0.4);
      this.sceneEcho.gain.setTargetAtTime(dist.echo, now, 0.4);
    }
    if (scene.loop && this.loop?.key === scene.loop) {
      this.ramp(this.loop.gain, target, FADE_IN);
    } else {
      this.stopLoop();
      if (scene.loop) void this.startLoop(scene.loop, target);
    }
    if (!hold) {
      for (const shot of scene.shots ?? []) {
        this.shotTimers.push(
          window.setTimeout(() => void this.playBuffer(shot.file, this.scene, LEVEL.shot * (shot.gain ?? 1)), shot.at * 1000),
        );
      }
    }
  }

  private async startLoop(key: string, target: number) {
    const buf = await this.load(key);
    const ctx = this.ctx;
    // Пока файл грузился, сцена могла смениться или звук выключили.
    if (!buf || !ctx || !this.canSfx() || this.loop) return;
    const w = this.sceneWanted;
    if (!w || SCENES[w.page]?.[w.index]?.loop !== key) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    // mp3 оставляет по краям несколько миллисекунд тишины — петля их обходит.
    if (buf.duration > 1) {
      src.loopStart = 0.04;
      src.loopEnd = buf.duration - 0.04;
    }
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(gain).connect(this.scene);
    // Каждый заход начинается с нового места петли, чтобы не звучать заученно.
    src.start(0, Math.random() * Math.max(0, buf.duration - 1));
    this.loop = { key, src, gain };
    this.ramp(gain, w.hold ? this.holdLevel() : target, FADE_IN);
  }

  private stopLoop() {
    const l = this.loop;
    if (!l || !this.ctx) return;
    this.loop = null;
    this.ramp(l.gain, 0, FADE_OUT);
    l.src.stop(this.ctx.currentTime + FADE_OUT + 0.1);
  }

  private clearShots() {
    this.shotTimers.forEach((t) => window.clearTimeout(t));
    this.shotTimers = [];
  }

  private ramp(g: GainNode, to: number, seconds: number) {
    const now = this.ctx!.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(to, now + seconds);
  }

  private async playBuffer(url: string, bus: GainNode, level: number) {
    const buf = await this.load(url);
    if (!buf || !this.canSfx()) return;
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = level;
    src.connect(g).connect(bus);
    src.start();
  }

  /** Ветер на появлении логотипа в заставке. */
  introWind() {
    if (this.canSfx()) void this.playBuffer(S("intro-wind"), this.ui, 0.35);
  }

  // ─── Звуки интерфейса (синтез) ────────────────────────────────────────
  //
  // Егор забраковал первую версию как «звуки из игры» — чистые синусы и
  // треугольники с резкой атакой. Теперь всё собрано из природных
  // материалов: касание дерева (маримба — основной тон плюс мягкий обертон
  // в 4 раза выше, как у настоящей пластины), шорох бумаги и ткани, дыхание
  // воздуха, тонкий стеклянный отзвук. И всё идёт через короткое
  // «пространство» (ревербератор на шине ui), без которого любой синтез
  // звучит сухо и дёшево.

  play(kind: UiSound) {
    if (!this.canSfx()) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.005;
    const vary = (x: number, spread = 0.03) => x * (1 + (Math.random() * 2 - 1) * spread);
    switch (kind) {
      case "hover": {
        const now = performance.now();
        if (now - this.lastHover < 90) return;
        this.lastHover = now;
        // едва слышное касание бумаги
        this.rustle(t, 0.045, 4200, 0.9, 0.018);
        break;
      }
      case "click":
        // мягкое касание деревянной пластины
        this.wood(t, vary(392), 0.34, 0.11);
        this.rustle(t, 0.02, 1800, 1.2, 0.02);
        break;
      case "toggle":
        this.wood(t, 523, 0.5, 0.09);
        this.wood(t + 0.12, 784, 0.7, 0.08);
        break;
      case "open":
        // вдох воздуха вверх и тонкий стеклянный отзвук
        this.breath(t, 0.34, 350, 2400, 0.05);
        this.glass(t + 0.12, 1568, 0.035);
        break;
      case "close":
        this.breath(t, 0.3, 2000, 380, 0.04);
        break;
      case "windows":
        // «тюк-тюк-тюк»: окошки появляются одно за другим, как мягкие
        // удары маримбы по восходящей пентатонике
        [523, 587, 659, 784].forEach((f, i) => this.wood(t + i * 0.12, vary(f, 0.01), 0.55, 0.075));
        break;
      case "swipe":
        // лист бумаги, скользнувший по столу
        this.rustle(t, 0.22, 1400, 0.6, 0.05);
        break;
      case "chapter":
        // медленное дыхание — сцена сменилась
        this.breath(t, 0.9, 220, 1100, 0.045);
        break;
    }
  }

  /** Короткое пространство для ui: шум с плавным затуханием как импульс. */
  private makeSpace() {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * 1.4);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    this.space = conv;
    // Отражения темнее прямого звука — как в комнате с деревом и тканью.
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 3800;
    const uiSend = ctx.createGain();
    uiSend.gain.value = 0.24;
    this.ui.connect(uiSend).connect(conv);
    conv.connect(tone).connect(this.master);
  }

  /** Деревянная пластина: тон + обертон ×4, быстрая атака, мягкий спад. */
  private wood(t: number, freq: number, dur: number, level: number) {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.gain.value = level;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2600;
    out.connect(lp).connect(this.ui);
    const partial = (mult: number, amp: number, decay: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + decay + 0.05);
    };
    partial(1, 1, dur);
    partial(3.98, 0.22, dur * 0.28);
    // «мягкая колотушка» — короткий тёмный шорох в момент касания
    this.rustle(t, 0.012, 900, 1.5, level * 0.35, out);
  }

  /** Тонкий стеклянный отзвук: два негармоничных обертона, медленная атака. */
  private glass(t: number, freq: number, level: number) {
    const ctx = this.ctx!;
    [1, 2.76].forEach((mult, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level * (i ? 0.35 : 1), t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (i ? 0.5 : 0.9));
      o.connect(g).connect(this.ui);
      o.start(t);
      o.stop(t + 1);
    });
  }

  private noise(dur: number) {
    const ctx = this.ctx!;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    // розовый шум мягче белого — ближе к бумаге и ткани
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  /** Шорох бумаги/ткани: розовый шум через полосу, плавный горб громкости. */
  private rustle(t: number, dur: number, freq: number, q: number, level: number, dest: AudioNode = this.ui) {
    const ctx = this.ctx!;
    const src = this.noise(dur);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + dur * 0.3);
    g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t);
  }

  /** Дыхание воздуха: мягкий шум с ползущим фильтром низких частот. */
  private breath(t: number, dur: number, from: number, to: number, level: number) {
    const ctx = this.ctx!;
    const src = this.noise(dur);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.Q.value = 0.4;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur * 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + dur * 0.45);
    g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(f).connect(g).connect(this.ui);
    src.start(t);
  }

  // ─── Переключатели ────────────────────────────────────────────────────

  setSfx(on: boolean) {
    this.settings = { ...this.settings, sfx: on };
    this.unlock();
    if (on) {
      const w = this.sceneWanted;
      if (w) this.startScene(w.page, w.index, w.hold);
      this.play("toggle");
    } else {
      this.clearShots();
      this.stopLoop();
    }
    this.emit();
  }

  /** Общая громкость сайта 0…1 — и звуки, и музыка. */
  setVolume(v: number) {
    const volume = Math.min(1, Math.max(0, v));
    this.settings = { ...this.settings, volume };
    if (this.ctx) this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    this.emit();
  }

  setMood(id: MoodId) {
    this.settings = { ...this.settings, mood: id };
    this.trackIndex = 0;
    if (this.musicPlaying) this.startMusic();
    this.emit();
  }

  toggleMusic(on = !this.musicPlaying) {
    this.unlock();
    this.settings = { ...this.settings, music: on };
    if (on) this.startMusic();
    else this.stopMusic();
    this.emit();
  }

  /** Уровни музыки по полосам 0…1 (низы слева) — для дорожки в шапке. */
  levels(bands: number, out: number[]) {
    const a = this.analyser;
    const f = this.freq;
    if (!a || !f || !this.musicPlaying) {
      for (let i = 0; i < bands; i++) out[i] = 0;
      return out;
    }
    a.getByteFrequencyData(f);
    // Полосы в логарифмической шкале: иначе почти вся дорожка — верха,
    // а бочка и бас, по которым и читается «в такт», достаются одной полоске.
    const n = f.length;
    for (let i = 0; i < bands; i++) {
      const lo = Math.floor(Math.pow(n, i / bands));
      const hi = Math.max(lo + 1, Math.floor(Math.pow(n, (i + 1) / bands)));
      let sum = 0;
      for (let k = lo; k < hi && k < n; k++) sum += f[k];
      out[i] = sum / (hi - lo) / 255;
    }
    return out;
  }

  get mood() {
    return MOODS.find((m) => m.id === this.settings.mood) ?? MOODS[0];
  }

  private ensureAudioEl() {
    if (this.audioEl || !this.ctx) return this.audioEl;
    const el = new Audio();
    el.preload = "none";
    el.addEventListener("ended", () => {
      const tracks = this.mood.tracks;
      if (!tracks.length) return;
      this.trackIndex = (this.trackIndex + 1) % tracks.length;
      el.src = tracks[this.trackIndex];
      void el.play().catch(() => {});
    });
    // Через Web Audio, а не el.volume: на iPhone volume у <audio> игнорируется.
    this.ctx.createMediaElementSource(el).connect(this.musicBus);
    this.audioEl = el;
    return el;
  }

  private startMusic() {
    const tracks = this.mood.tracks;
    const el = this.ensureAudioEl();
    if (!el || !tracks.length) {
      this.musicPlaying = false;
      if (el) el.pause();
      return;
    }
    const src = tracks[this.trackIndex % tracks.length];
    if (!el.src.endsWith(src)) el.src = src;
    this.musicBus.gain.cancelScheduledValues(this.ctx!.currentTime);
    this.musicBus.gain.setValueAtTime(0, this.ctx!.currentTime);
    this.musicBus.gain.linearRampToValueAtTime(LEVEL.music, this.ctx!.currentTime + 1.2);
    void el.play().catch(() => {});
    this.musicPlaying = true;
  }

  private stopMusic() {
    this.musicPlaying = false;
    const el = this.audioEl;
    if (!el || !this.ctx) return;
    this.ramp(this.musicBus, 0, 0.6);
    window.setTimeout(() => {
      if (!this.musicPlaying) el.pause();
    }, 650);
  }
}

let engine: SoundEngine | null = null;

/** Движок один на вкладку; на сервере — null. */
export function sound(): SoundEngine | null {
  if (typeof window === "undefined") return null;
  if (!engine) {
    engine = new SoundEngine();
    engine.init();
  }
  return engine;
}

export function playUi(kind: UiSound) {
  sound()?.play(kind);
}
