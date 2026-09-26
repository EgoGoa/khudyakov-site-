#!/usr/bin/env bash
# Собирает статичную версию сайта для хостинга reg.ru (без сервера Next.js).
# Основной проект не трогает: копирует код в ../khudyakov-site-static,
# убирает серверную часть, собирает и пакует в hdkv-ai-static.zip.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST="$SRC/../khudyakov-site-static"

mkdir -p "$DST"
rsync -a --delete \
  --exclude node_modules --exclude .next --exclude out --exclude .git \
  --exclude _backups --exclude .claude --exclude 'hdkv-ai-static.zip' \
  "$SRC/" "$DST/"
[ -d "$DST/node_modules" ] || cp -cR "$SRC/node_modules" "$DST/node_modules"

cd "$DST"
rm -rf src/app/api src/app/admin src/middleware.ts src/proxy.ts

cat > next.config.mjs <<'CFG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
CFG

# формы: /api/lead -> lead.php
grep -rl 'fetch("/api/lead"' src | xargs perl -pi -e 's#fetch\("/api/lead"#fetch("/lead.php"#g'

# динамические маршруты метаданных должны быть статичными
for f in src/app/apple-icon.tsx src/app/icon.tsx src/app/opengraph-image.tsx src/app/robots.ts src/app/sitemap.ts; do
  grep -q 'force-static' "$f" || printf '\nexport const dynamic = "force-static";\n' >> "$f"
done
perl -pi -e 's#disallow: \["/admin", "/api"\]#disallow: []#' src/app/robots.ts

# аналитика Vercel вне Vercel даёт только 404
perl -ni -e 'print unless /import \{ Analytics \} from "\@vercel\/analytics\/next";/ || /<Analytics \/>/' src/app/layout.tsx

cp "$SRC/scripts/static-public/lead.php" public/lead.php
cp "$SRC/scripts/static-public/.htaccess" public/.htaccess

npm run build
rm -f hdkv-ai-static.zip
(cd out && zip -qr ../hdkv-ai-static.zip . -x '.DS_Store')
echo "Готово: $DST/hdkv-ai-static.zip"
