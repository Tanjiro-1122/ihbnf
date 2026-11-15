import { ImageResponse } from "next/og";

export const alt = "IHBNF — Idle Hands Bear No Fruit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px 80px", background: "#0b0a09", color: "#ede6da" }}>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8, color: "#c9a45c" }}>IHBNF</div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 86, lineHeight: 1.02, fontWeight: 700 }}>Idle Hands Bear No Fruit.</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#a89f91" }}>Books · Apps · Sports Tech · Javier Huertas</div>
      </div>
    ),
    size,
  );
}
