// Режет мобильные рилы (public/video/<page>-reel-mobile.mp4) на отдельные клипы
// по фазам глав: public/video/clips/<page>-reel-<i>.mp4. Телефон играет клип
// своей главы целиком (без перемотки длинного ролика — на iOS она и давала
// «дёргания»). Запускать заново, если поменялись PHASES на странице.
//   node scripts/cut-phase-clips.mjs
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Столько секунд до границы фазы стадия держит последний кадр (HOLD_BACK_SECONDS
// в CinematicStage). Клип главы N начинается там же, где остановился клип N-1,
// поэтому растворение между ними не видно.
const HOLD = 0.12;
const pages = ["content", "ai", "sites", "smm"];

for (const page of pages) {
  const tsx = readFileSync(`src/app/(landing)/${page}/page.tsx`, "utf8");
  const block = tsx.slice(tsx.indexOf("const PHASES"));
  const body = block.slice(0, block.indexOf("];"));
  const phases = [...body.matchAll(/start:\s*([\d.]+),\s*end:\s*([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  const input = `public/video/${page}-reel-mobile.mp4`;
  const dur = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", input]).toString();
  phases.forEach(([s, e], i) => {
    const from = i === 0 ? 0 : s - HOLD;
    const to = Math.min(e, dur) - (i === phases.length - 1 ? 0 : HOLD);
    const out = `public/video/clips/${page}-reel-${i}.mp4`;
    execFileSync("ffmpeg", [
      "-y", "-v", "error", "-ss", from.toFixed(3), "-to", to.toFixed(3), "-i", input,
      "-an", "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
      "-crf", "27", "-preset", "slow", "-g", "48", "-movflags", "+faststart", out,
    ]);
    console.log(out, from.toFixed(2), "→", to.toFixed(2));
  });
}
