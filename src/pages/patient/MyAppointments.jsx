import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { useAuth } from "../../context/AuthContext";
import { getPatientAppointments } from "../../services/appointments";
import { formatDate, getStatusColor } from "../../utils/helpers";

const TABS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");

  useEffect(() => {
    if (!user) return;
    getPatientAppointments(user.uid).then(data => {
      setAppointments(data);
      setLoading(false);
    });
  }, [user]);

  const filtered = tab === "All"
    ? appointments
    : appointments.filter(a => a.status.toLowerCase() === tab.toLowerCase());

  return (
    <Layout type="patient" title="My Appointments">
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 18px", borderRadius: 50,
            border: "1.5px solid",
            borderColor: tab === t ? "var(--teal)" : "var(--border)",
            background: tab === t ? "var(--teal)" : "white",
            color: tab === t ? "white" : "var(--text-mid)",
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-light)" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 14, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
          <p style={{ color: "var(--text-light)", fontSize: 14 }}>No {tab === "All" ? "" : tab.toLowerCase()} appointments found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(appt => {
            const sc = getStatusColor(appt.status);
            return (
              <div key={appt.id} style={{
                background: "white", border: "1px solid var(--border)",
                borderRadius: 14, padding: "18px 22px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: "0 2px 8px rgba(26,95,122,0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: "var(--teal-light)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>🏥</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-dark)" }}>{appt.service}</div>
                    <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 3 }}>
                      📅 {formatDate(appt.date)} &nbsp;·&nbsp; ⏰ {appt.timeSlot}
                    </div>
                    {appt.area && (
                      <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>
                        📍 {appt.area}
                      </div>
                    )}
                  </div>
                </div>
                <span style={{
                  padding: "5px 14px", borderRadius: 50,
                  fontSize: 12, fontWeight: 600,
                  background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                  whiteSpace: "nowrap",
                }}>
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
