import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { useAuth } from "../../context/AuthContext";
import { createAppointment } from "../../services/appointments";
import { SERVICES, TIME_SLOTS, AREAS } from "../../utils/helpers";

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    service: "", date: "", timeSlot: "", area: "", address: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function handle(field, val) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.service || !form.date || !form.timeSlot || !form.area) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await createAppointment({ ...form, patientId: user.uid });
      setSuccess(true);
    } catch (err) {
      setError("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid var(--border)", borderRadius: 8,
    fontSize: 14, color: "var(--text-dark)", background: "white",
    outline: "none", fontFamily: "inherit",
  };

  if (success) return (
    <Layout type="patient" title="Book Appointment">
      <div style={{
        maxWidth: 480, margin: "40px auto", textAlign: "center",
        background: "white", borderRadius: 16, padding: "48px 32px",
        border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(26,95,122,0.06)",
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--teal-dark)", marginBottom: 10 }}>
          Appointment Booked!
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 8 }}>
          Your appointment for <strong>{form.service}</strong>
        </p>
        <p style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 28 }}>
          on <strong>{form.date}</strong> at <strong>{form.timeSlot}</strong> has been submitted.
          We'll confirm shortly.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => navigate("/dashboard/appointments")}
            style={{
              background: "var(--teal)", color: "white", border: "none",
              borderRadius: 8, padding: "11px 22px", fontWeight: 600,
              fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>
            View My Appointments
          </button>
          <button onClick={() => { setSuccess(false); setForm({ service:"",date:"",timeSlot:"",area:"",address:"",notes:"" }); }}
            style={{
              background: "white", color: "var(--teal)", border: "1.5px solid var(--teal)",
              borderRadius: 8, padding: "11px 22px", fontWeight: 600,
              fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>
            Book Another
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout type="patient" title="Book Appointment">
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{
          background: "white", border: "1px solid var(--border)",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 2px 12px rgba(26,95,122,0.06)",
        }}>
          <div style={{ background: "linear-gradient(135deg, var(--teal-dark), var(--teal))", padding: "24px 28px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "white" }}>Book a Home Visit Session</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
              Fill in the details below — we'll confirm within a few hours
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 28 }}>
            {/* Service */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Service Required *
              </label>
              <select style={inputStyle} value={form.service} onChange={e => handle("service", e.target.value)} required>
                <option value="">Select a service</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Date + Time */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Preferred Date *</label>
                <input style={inputStyle} type="date" min={today} value={form.date} onChange={e => handle("date", e.target.value)} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Time Slot *</label>
                <select style={inputStyle} value={form.timeSlot} onChange={e => handle("timeSlot", e.target.value)} required>
                  <option value="">Select time</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Area */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Area *</label>
              <select style={inputStyle} value={form.area} onChange={e => handle("area", e.target.value)} required>
                <option value="">Select your area</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Address */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Full Address</label>
              <input style={inputStyle} type="text" placeholder="Your home address" value={form.address} onChange={e => handle("address", e.target.value)} />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Describe your condition <span style={{ color: "var(--text-light)", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                placeholder="Briefly describe your pain or condition..."
                value={form.notes}
                onChange={e => handle("notes", e.target.value)}
              />
            </div>

            {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                background: "var(--teal)", color: "white",
                border: "none", borderRadius: 8,
                fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1, fontFamily: "inherit",
              }}
            >
              {loading ? "Booking..." : "Confirm Appointment →"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
