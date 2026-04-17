import React from "react";

export default function LoginLogo({ subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <img
        src="/logo.png"
        alt="NIRMAXIS"
        style={{ height: 64, width: "auto", objectFit: "contain", marginBottom: 10, display: "block", margin: "0 auto 10px" }}
        onError={e => { e.currentTarget.style.display = "none"; }}
      />
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--teal)", letterSpacing: 2, fontFamily: "'DM Sans', sans-serif" }}>
        NIRMAXIS
      </div>
      <div style={{
        fontSize: 10, color: "var(--text-light)", letterSpacing: 2, marginTop: 4,
        padding: "3px 10px", background: "var(--cream)",
        borderRadius: 50, display: "inline-block", border: "1px solid var(--border)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {subtitle || "NEURO & ORTHO REHABILITATION"}
      </div>
    </div>
  );
}