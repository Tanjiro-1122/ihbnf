import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0a09" }}>
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <path d="M16 22.6V15.2c0-3.7 2.3-6.5 6.1-7.6" stroke="#c9a45c" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M22.1 7.6c.7 3-1 5.2-4.3 5.5-.4-3 1.3-5 4.3-5.5Z" fill="#c9a45c" />
          <ellipse cx="16" cy="24.2" rx="2.9" ry="1.8" fill="#c9a45c" />
        </svg>
      </div>
    ),
    size,
  );
}
