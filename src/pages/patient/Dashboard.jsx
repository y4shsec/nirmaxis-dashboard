import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { useAuth } from "../../context/AuthContext";
import { getPatientAppointments } from "../../services/appointments";
import { getPatient } from "../../services/patients";
import { formatDate, getStatusColor } from "../../utils/helpers";

function StatCard({ icon, label, value, color = "var(--teal)" }) {
  return (
    <div style={{
      background: "white", border: "1px solid var(--border)",
      borderRadius: 14, padding: "20px 24px",
      display: "flex", alignItems: "center", gap: 16,
      boxShadow: "0 2px 12px rgba(26,95,122,0.06)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "var(--teal-dark)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [appts, pat] = await Promise.all([
        getPatientAppointments(user.uid),
        getPatient(user.uid),
      ]);
      setAppointments(appts);
      setPatient(pat);
      setLoading(false);
    }
    load();
  }, [user]);

  const upcoming = appointments.filter(a => a.status === "pending" || a.status === "confirmed");
  const completed = appointments.filter(a => a.status === "completed");

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = patient?.name?.split(" ")[0] || "Patient";

  return (
    <Layout type="patient" title="Dashboard">
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-light)" }}>Loading...</div>
      ) : (
        <>
          {/* Greeting */}
          <div style={{
            background: "linear-gradient(135deg, var(--teal-dark), var(--teal))",
            borderRadius: 16, padding: "28px 32px", marginBottom: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>{greeting()},</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>{firstName} 👋</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
                {upcoming.length > 0
                  ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? "s" : ""}.`
                  : "No upcoming appointments. Book your next session!"}
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/book")}
              style={{
                background: "var(--gold)", color: "var(--teal-dark)",
                border: "none", borderRadius: 10, padding: "12px 22px",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                fontFamily: "inherit", whiteSpace: "nowrap",
              }}
            >
              + Book Session
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
            <StatCard icon="📅" label="Total Appointments" value={appointments.length} />
            <StatCard icon="⏳" label="Upcoming" value={upcoming.length} color="#c9a84c" />
            <StatCard icon="✅" label="Completed" value={completed.length} color="#2e7d32" />
          </div>

          {/* Upcoming appointments */}
          <div style={{
            background: "white", border: "1px solid var(--border)",
            borderRadius: 14, boxShadow: "0 2px 12px rgba(26,95,122,0.06)",
          }}>
            <div style={{
              padding: "18px 24px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--teal-dark)" }}>Upcoming Appointments</h3>
              <button onClick={() => navigate("/dashboard/appointments")}
                style={{ background: "none", border: "none", color: "var(--teal)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                View all →
              </button>
            </div>

            {upcoming.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 24px" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
                <p style={{ color: "var(--text-light)", fontSize: 14 }}>No upcoming appointments.</p>
                <button onClick={() => navigate("/dashboard/book")}
                  style={{
                    marginTop: 14, background: "var(--teal)", color: "white",
                    border: "none", borderRadius: 8, padding: "10px 22px",
                    fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}>
                  Book Now
                </button>
              </div>
            ) : (
              <div style={{ padding: "8px 0" }}>
                {upcoming.slice(0, 3).map(appt => {
                  const sc = getStatusColor(appt.status);
                  return (
                    <div key={appt.id} style={{
                      padding: "14px 24px", borderBottom: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 10,
                          background: "var(--teal-light)", display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 18,
                        }}>🏥</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>{appt.service}</div>
                          <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>
                            {formatDate(appt.date)} · {appt.timeSlot}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        padding: "4px 12px", borderRadius: 50,
                        fontSize: 11, fontWeight: 600,
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                      }}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile incomplete warning */}
          {patient && !patient.name && (
            <div style={{
              marginTop: 20, padding: "14px 20px",
              background: "#fff8e1", border: "1px solid #ffe082",
              borderRadius: 12, display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 16,
            }}>
              <div style={{ fontSize: 14, color: "#e65100" }}>
                ⚠️ Your profile is incomplete. Add your name and details.
              </div>
              <button onClick={() => navigate("/dashboard/profile")}
                style={{
                  background: "#e65100", color: "white", border: "none",
                  borderRadius: 8, padding: "8px 16px", fontSize: 13,
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}>
                Complete Profile
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
