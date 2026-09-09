import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Shown when a link to the site is pasted into Telegram/WhatsApp/etc — both
// the site's own CTA channels — so a link shared out of one of those chats
// gets a real preview card instead of the platform's blank-link fallback.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 90px",
          background: "#0B0B10",
          backgroundImage:
            "radial-gradient(circle at 82% 18%, rgba(245,49,11,0.35), transparent 45%), radial-gradient(circle at 8% 88%, rgba(0,210,255,0.22), transparent 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#F5310B", display: "flex" }} />
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#DCDDEF", letterSpacing: -1 }}>
            HDKV<span style={{ color: "#F5310B" }}>.AGENCY</span>
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 60, fontWeight: 700, color: "#DCDDEF", lineHeight: 1.15, maxWidth: 920 }}>
          Digital AI, который быстрее рынка
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: "rgba(220,221,239,0.6)", maxWidth: 820 }}>
          Продакшн, брендинг и SMM — усиленные AI. 8 лет опыта, 450+ проектов, 350+ клиентов.
        </div>
      </div>
    ),
    { ...size }
  );
}
