import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/auth";
// import { getPatient } from "../../services/patients"; 
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";

function HeaderAvatar({ type }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef();

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) setName(snap.data().name || "");
    });
  }, [user]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = name?.[0]?.toUpperCase() || (user?.phoneNumber?.[3]) || (user?.email?.[0]?.toUpperCase()) || "U";
  const displayName = name || user?.email || user?.phoneNumber || "User";
  const sub = type === "admin" ? "Administrator" : "Patient";

  async function handleLogout() {
    await logout();
    navigate(type === "admin" ? "/admin/login" : "/login");
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: open ? "var(--cream)" : "transparent",
          border: "1.5px solid", borderColor: open ? "var(--teal)" : "var(--border)",
          borderRadius: 50, padding: "5px 14px 5px 5px",
          cursor: "pointer", fontFamily: "inherit",
          transition: "all 0.18s",
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--teal-dark), var(--teal))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0,
        }}>{initial}</div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
          <div style={{ fontSize: 10, color: "var(--text-light)" }}>{sub}</div>
        </div>
        <span style={{ fontSize: 10, color: "var(--text-light)", marginLeft: 2, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", display: "inline-block" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          background: "white", border: "1px solid var(--border)",
          borderRadius: 12, minWidth: 200, boxShadow: "0 8px 32px rgba(26,95,122,0.15)",
          zIndex: 200, overflow: "hidden",
          animation: "fadeDown 0.15s ease",
        }}>
          <style>{`@keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--cream)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{displayName}</div>
            <div style={{ fontSize: 11, color: "var(--text-light)" }}>{user?.email || user?.phoneNumber}</div>
          </div>
          {[
            { label: "Edit Profile", icon: "✏️", action: () => { navigate(type === "admin" ? "/admin/profile" : "/dashboard/profile"); setOpen(false); } },
            { label: "Logout",       icon: "🚪", action: handleLogout, danger: true },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "12px 16px", background: "none", border: "none",
              textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              fontSize: 13, color: item.danger ? "#e53935" : "var(--text-dark)",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = item.danger ? "#ffebee" : "var(--cream)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children, type = "patient", title = "" }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream)" }}>
      <Sidebar type={type} />
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top header */}
        <div style={{
          height: 62, background: "white",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px", position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 0 var(--border)",
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--teal-dark)" }}>{title}</h1>
          <HeaderAvatar type={type} />
        </div>
        {/* Page */}
        <div style={{ padding: 28, flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}