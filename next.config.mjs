import { execSync } from "node:child_process";

/** @type {import('next').NextConfig} */

// Build id для заставки при входе (IntroSplash): короткий хэш текущего
// коммита, зашитый в бандл на этапе сборки. IntroSplash сверяет его с тем,
// что сохранён у посетителя — если сайт обновился (новый коммит = новый
// деплой), заставка играет ему ещё раз, даже если он уже видел её в эту
// сессию раньше. Без коммита (например, архив без .git) откатывается на
// время сборки — тоже меняется на каждом деплое, просто не читается глазом.
let buildId;
try {
  buildId = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
} catch {
  buildId = String(Date.now());
}

const nextConfig = {
  // Hides the round "N" dev badge; it never ships to production anyway.
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  // Копия на khudyakov-site.vercel.app закрыта от индекса: главный домен
  // для поиска — hdkv-ai.ru (src/lib/site.ts). Статичная сборка для reg.ru
  // этот конфиг не использует, так что там заголовка нет.
  async headers() {
    if (!process.env.VERCEL) return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }];
  },
  async redirects() {
    return [
      { source: "/portfolio", destination: "/#works", permanent: false },
      // /brief used to bounce to the contact form; it is a real page now
    ];
  },
};

export default nextConfig;
