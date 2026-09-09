import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// No standalone logo asset exists yet (the wordmark is styled text, see
// Header.tsx) — generated at build/request time instead of hand-drawing a
// bitmap, so it stays in sync if the brand mark ever changes here.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0B10",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#F5310B",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
