import { ImageResponse } from "next/og";

export const alt = "IHBNF — Idle Hands Bear No Fruit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social preview. Drop a custom /public/media/brand/og.png and reference it in metadata to override.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0b0a09",
          backgroundImage: "radial-gradient(circle at 85% 10%, rgba(201,164,92,0.28), transparent 55%)",
          color: "#ede6da",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: "#a89f91" }}>STORIES · TECHNOLOGY · IDEAS</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 230, fontWeight: 300, letterSpacing: -10, lineHeight: 0.9 }}>IHBNF</div>
          <div style={{ fontSize: 54, color: "#c9a45c", marginTop: 18, fontStyle: "italic" }}>Idle Hands Bear No Fruit.</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a89f91" }}>Created by Javier Huertas</div>
      </div>
    ),
    size,
  );
}
