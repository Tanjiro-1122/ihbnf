import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0a09" }}>
        <img src="https://ihbnf.com/media/brand/ihbnf-secondary-icon.jpg" width="180" height="180" style={{ width: "180px", height: "180px", objectFit: "contain" }} />
      </div>
    ),
    size,
  );
}
