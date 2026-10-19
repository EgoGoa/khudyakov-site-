#!/usr/bin/env bash
# Собирает статичную версию сайта для хостинга reg.ru (без сервера Next.js).
# Основной проект не трогает: копирует код в ../khudyakov-site-static,
# убирает серверную часть, собирает и пакует в hdkv-ai-static.zip.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST="$SRC/../khudyakov-site-static"

mkdir -p "$DST"
rsync -a --delete \
  --exclude node_modules --exclude .next --exclude '.next-*' --exclude out --exclude .git \
  --exclude _backups --exclude .claude --exclude 'hdkv-ai-static.zip' \
  "$SRC/" "$DST/"
[ -d "$DST/node_modules" ] || cp -cR "$SRC/node_modules" "$DST/node_modules"
# Новые зависимости (например next-intl) в уже скопированную папку доезжают
# отдельно: существующие файлы не трогаем.
cp -cRn "$SRC/node_modules/." "$DST/node_modules/" 2>/dev/null || true
# Папка второго dev-сервера (превью другого чата): её типы ссылаются на
# админку, которой в статичной версии нет, и ломают проверку TypeScript.
rm -rf "$DST/.next-preview"

cd "$DST"
rm -rf src/app/api "src/app/(ru)/admin" src/middleware.ts src/proxy.ts

cat > next.config.mjs <<'CFG'
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
CFG

# формы: /api/lead -> lead.php
grep -rl 'fetch("/api/lead"' src | xargs perl -pi -e 's#fetch\("/api/lead"#fetch("/lead.php"#g'

# голосовой ассистент: /api/voice -> voice.php, а инструкция и карта сайта
# для ИИ — статичным файлом voice-data.json рядом с ним
grep -rl 'fetch("/api/voice"' src | xargs perl -pi -e 's#fetch\("/api/voice"#fetch("/voice.php"#g'
grep -rl "/api/tts?" src | xargs perl -pi -e "s#/api/tts\\?#/tts.php?#g"
mkdir -p src/app/voice-data.json
cat > src/app/voice-data.json/route.ts <<'TS'
import { VOICE_ROUTES, VOICE_SYSTEM, voiceSystemEn } from "@/lib/voice/prompt";
import { enableEnglishForRequest } from "@/i18n/jsx/server";

export const dynamic = "force-static";

export function GET() {
  enableEnglishForRequest();
  return Response.json({ system: VOICE_SYSTEM, systemEn: voiceSystemEn(), routes: [...VOICE_ROUTES] });
}
TS

# динамические маршруты метаданных должны быть статичными
for f in src/app/opengraph-image.tsx src/app/robots.ts src/app/sitemap.ts; do
  grep -q 'force-static' "$f" || printf '\nexport const dynamic = "force-static";\n' >> "$f"
done
perl -pi -e 's#disallow: \["/admin", "/api"\]#disallow: []#' src/app/robots.ts

# аналитика Vercel вне Vercel даёт только 404
perl -ni -e 'print unless /import \{ Analytics \} from "\@vercel\/analytics\/next";/ || /<Analytics \/>/' src/components/layout/SiteShell.tsx

cp "$SRC/scripts/static-public/lead.php" public/lead.php
cp "$SRC/scripts/static-public/voice.php" public/voice.php
cp "$SRC/scripts/static-public/tts.php" public/tts.php
cp "$SRC/scripts/static-public/.htaccess" public/.htaccess

npm run build
rm -f hdkv-ai-static.zip
(cd out && zip -qr ../hdkv-ai-static.zip . -x '.DS_Store')
echo "Готово: $DST/hdkv-ai-static.zip"
