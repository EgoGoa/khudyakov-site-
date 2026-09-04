// Server-side delivery of a submitted brief.
//
// The form used to hand the brief to the visitor's own mail client and hope.
// That could not work: a Russian brief encodes to a ~7.6k-character mailto:
// link (and ~3.9k with every answer left blank), well past the ~2 KB an
// Outlook/ShellExecute URL survives, so the body was truncated or the link
// never opened — silently, on both ends. This is the route that does not
// depend on the visitor having a mail client at all.
//
// Telegram rather than SMTP because it is already the agency's main intake
// channel (the footer and every "обсудить" CTA point at the same account), it
// needs no mail server or third-party sending domain, and a bot token plus a
// chat id is the whole configuration.
//
// Configuration (in .env.local locally, in the host's environment variables in
// production):
//   TELEGRAM_BOT_TOKEN  — from @BotFather
//   TELEGRAM_CHAT_ID    — the chat the brief is posted into; for a personal
//                         account, message the bot once and read it from
//                         https://api.telegram.org/bot<TOKEN>/getUpdates
//
// Both unset is a supported state, not an error: isDeliveryConfigured() is
// false, the API route says so, and the form falls back to the clipboard flow
// exactly as it behaves today. Nothing about the site breaks before this is
// switched on.

const TELEGRAM_API_BASE = process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org";

// Telegram rejects a sendMessage over 4096 characters. Split a little under
// that so a chunk's own "(1/3)" header can never push it over.
const CHUNK_LIMIT = 3900;

export function isDeliveryConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

// Splits on line boundaries so a chunk never cuts through the middle of a
// question, falling back to a hard cut for a single line longer than the
// limit (an answer pasted as one enormous paragraph).
function chunk(text: string): string[] {
  if (text.length <= CHUNK_LIMIT) return [text];
  const out: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if (line.length > CHUNK_LIMIT) {
      if (current) {
        out.push(current);
        current = "";
      }
      for (let i = 0; i < line.length; i += CHUNK_LIMIT) {
        out.push(line.slice(i, i + CHUNK_LIMIT));
      }
      continue;
    }
    if (current.length + line.length + 1 > CHUNK_LIMIT) {
      out.push(current);
      current = line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current) out.push(current);
  return out;
}

/** Posts the brief into the configured chat. Resolves to whether it landed;
 *  the caller decides what the visitor is told. Never throws — a delivery
 *  failure has to degrade into the clipboard fallback, not a 500 that loses
 *  the answers the visitor just spent five minutes on. */
export async function deliverBrief(subject: string, body: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const parts = chunk(`${subject}\n\n${body}`.trim());

  try {
    for (let i = 0; i < parts.length; i++) {
      const header = parts.length > 1 ? `(${i + 1}/${parts.length})\n` : "";
      const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `${header}${parts[i]}`,
          disable_web_page_preview: true,
        }),
        // A visitor is watching a spinner: fail over to the clipboard flow
        // rather than hang on an unreachable Telegram.
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        // Logged, not surfaced: the visitor gets the fallback, and the
        // reason belongs in the host's function logs where it can be read.
        console.error(
          `[brief] Telegram sendMessage failed: ${res.status} ${await res.text().catch(() => "")}`
        );
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("[brief] Telegram delivery threw:", error);
    return false;
  }
}
