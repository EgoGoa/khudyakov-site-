#!/usr/bin/env bash
# Публикация сайта на reg.ru: собирает статичную версию и отправляет на
# хостинг по SSH только изменившиеся файлы. Запуск: npm run deploy:ru
# Проверка без отправки: npm run deploy:ru -- --dry-run
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$SRC/../khudyakov-site-static/out"
KEY="$HOME/.ssh/hdkv_reg"
REMOTE="u3652935@server286.hosting.reg.ru"
REMOTE_DIR="www/hdkv-ai.ru/"  # одна папка, два имени: hud-service.ru и hdkv-ai.ru (лимит сайтов на Host-A)

"$SRC/scripts/build-static.sh"

# .well-known — проверки Let's Encrypt, cgi-bin — служебная папка хостинга:
# --delete их не трогает.
# Файлы с правами 600 (например, скопированные из закрытой папки) rsync
# переносит как есть, и nginx отдаёт по ним 403 — фото команды «под
# вопросиком». Перед отправкой открываем всё на чтение.
find "$OUT" -type f -exec chmod a+r {} +
find "$OUT" -type d -exec chmod a+rx {} +

# Старые файлы сборки (_next/static) не удаляем: открытая у посетителя
# прежняя страница ссылается на них, и без них она теряет стили.
rsync -az --delete --human-readable --stats \
  --exclude '.well-known' --exclude 'cgi-bin' \
  --filter 'P _next/static/' \
  -e "ssh -i $KEY -o IdentitiesOnly=yes -o BatchMode=yes" \
  "$@" "$OUT/" "$REMOTE:$REMOTE_DIR"

echo "Готово: https://hud-service.ru"
