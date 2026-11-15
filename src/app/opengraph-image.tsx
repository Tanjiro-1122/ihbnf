import { ImageResponse } from "next/og";

export const alt = "IHBNF — Idle Hands Bear No Fruit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: "64px 72px", background: "#0b0a09", color: "#ede6da" }}>
        <img src="https://ihbnf.com/media/brand/ihbnf-icon.svg" width="360" height="360" style={{ width: "360px", height: "360px", objectFit: "cover", borderRadius: "50%" }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 8, color: "#c9a45c" }}>IHBNF</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 72, lineHeight: 1.02, fontWeight: 700 }}>Idle Hands Bear No Fruit.</div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 28, color: "#a89f91" }}>Books · Apps · Sports Tech · Javier Huertas</div>
        </div>
      </div>
    ),
    size,
  );
}
