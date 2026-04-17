import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { getAllPayments, addPayment } from "../../services/payments";
import { getAllAppointments } from "../../services/appointments";
import { getAllPatients } from "../../services/patients";
import { formatDate, formatINR } from "../../utils/helpers";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#1a5f7a","#c9a84c","#2e7d32","#e53935"];

function AddPaymentModal({ appointments, patients, onClose, onAdded }) {
  const [form, setForm] = useState({ appointmentId:"", patientId:"", amount:"", method:"cash", status:"paid", notes:"" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await addPayment({ ...form, amount: Number(form.amount) });
    setSaving(false);
    onAdded();
    onClose();
  }

  const sel = { width:"100%", padding:"10px 14px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", background:"white" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:16, width:"100%", maxWidth:480 }} onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg, var(--teal-dark), var(--teal))", padding:"20px 24px", borderRadius:"16px 16px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:16, fontWeight:700, color:"white" }}>Add Payment Record</span>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:18 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding:24 }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6, color:"var(--text-dark)" }}>Appointment</label>
            <select style={sel} value={form.appointmentId} onChange={e => {
              const appt = appointments.find(a => a.id === e.target.value);
              setForm(p => ({ ...p, appointmentId: e.target.value, patientId: appt?.patientId || "" }));
            }} required>
              <option value="">Select appointment</option>
              {appointments.filter(a => a.status === "completed").map(a => (
                <option key={a.id} value={a.id}>{a.service} — {formatDate(a.date)}</option>
              ))}
            </select>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6, color:"var(--text-dark)" }}>Amount (₹)</label>
              <input style={sel} type="number" placeholder="600" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6, color:"var(--text-dark)" }}>Payment Method</label>
              <select style={sel} value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6, color:"var(--text-dark)" }}>Status</label>
            <select style={sel} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>
          <button type="submit" disabled={saving} style={{ width:"100%", padding:"12px", background:"var(--teal)", color:"white", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            {saving ? "Saving..." : "Save Payment →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminRevenue() {
  const [payments,     setPayments]     = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [pay, appts, pats] = await Promise.all([
      getAllPayments(), getAllAppointments(), getAllPatients(),
    ]);
    setPayments(pay);
    setAppointments(appts);
    setPatients(pats);
    setLoading(false);
  }

  const totalPaid    = payments.filter(p => p.status === "paid").reduce((s,p) => s + (p.amount||0), 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s,p) => s + (p.amount||0), 0);
  const totalPartial = payments.filter(p => p.status === "partial").reduce((s,p) => s + (p.amount||0), 0);

  // Monthly data for bar chart
  const monthly = {};
  payments.forEach(p => {
    if (p.status !== "paid") return;
    const d = p.createdAt?.toDate?.() || new Date();
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    monthly[k] = (monthly[k]||0) + (p.amount||0);
  });
  const chartData = Object.entries(monthly).sort(([a],[b])=>a.localeCompare(b)).map(([month,revenue]) => ({ month, revenue }));

  // Pie data — payment method
  const methods = {};
  payments.forEach(p => { methods[p.method] = (methods[p.method]||0) + (p.amount||0); });
  const pieData = Object.entries(methods).map(([name,value]) => ({ name, value }));

  return (
    <Layout type="admin" title="Revenue">
      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--text-light)" }}>Loading...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
            {[
              { label:"Total Collected", value: formatINR(totalPaid),    bg:"#e8f5e9", color:"#1b5e20", icon:"✅" },
              { label:"Pending Amount",  value: formatINR(totalPending), bg:"#fff8e1", color:"#e65100", icon:"⏳" },
              { label:"Partial Payments",value: formatINR(totalPartial), bg:"#e3f2fd", color:"#0d47a1", icon:"🔄" },
            ].map(s => (
              <div key={s.label} style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, padding:"22px 24px", boxShadow:"0 2px 12px rgba(26,95,122,0.06)" }}>
                <div style={{ fontSize:12, color:"var(--text-light)", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:28, fontWeight:700, color:"var(--teal-dark)" }}>{s.value}</div>
                <div style={{ marginTop:8, display:"inline-flex", alignItems:"center", gap:6, background:s.bg, color:s.color, borderRadius:50, padding:"3px 10px", fontSize:12, fontWeight:600 }}>
                  {s.icon} {s.label.split(" ")[0]}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:20, marginBottom:24 }}>
            <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, padding:"22px 24px", boxShadow:"0 2px 12px rgba(26,95,122,0.06)" }}>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--teal-dark)", marginBottom:20 }}>Monthly Revenue</div>
              {chartData.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text-light)", fontSize:13 }}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" />
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:"#7a7a9a" }} />
                    <YAxis tick={{ fontSize:11, fill:"#7a7a9a" }} tickFormatter={v => `₹${v}`} />
                    <Tooltip formatter={v => [`₹${v}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="#1a5f7a" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, padding:"22px 24px", boxShadow:"0 2px 12px rgba(26,95,122,0.06)" }}>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--teal-dark)", marginBottom:20 }}>By Payment Method</div>
              {pieData.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text-light)", fontSize:13 }}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {pieData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [`₹${v}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Payment records table */}
          <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(26,95,122,0.06)" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:15, fontWeight:600, color:"var(--teal-dark)" }}>Payment Records</span>
              <button onClick={() => setShowModal(true)} style={{ background:"var(--teal)", color:"white", border:"none", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                + Add Payment
              </button>
            </div>
            {payments.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 24px" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>💳</div>
                <p style={{ color:"var(--text-light)", fontSize:14 }}>No payment records yet. Add your first payment above.</p>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"var(--cream)" }}>
                      {["Date","Service","Amount","Method","Status"].map(h => (
                        <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"var(--text-light)", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => {
                      const appt = appointments.find(a => a.id === p.appointmentId);
                      const statusColors = {
                        paid:    { bg:"#e8f5e9", color:"#1b5e20", border:"#a5d6a7" },
                        pending: { bg:"#fff8e1", color:"#e65100", border:"#ffe082" },
                        partial: { bg:"#e3f2fd", color:"#0d47a1", border:"#90caf9" },
                      };
                      const sc = statusColors[p.status] || statusColors.pending;
                      return (
                        <tr key={p.id} style={{ borderBottom:"1px solid var(--border)" }}
                          onMouseEnter={e => e.currentTarget.style.background="#fafafa"}
                          onMouseLeave={e => e.currentTarget.style.background="white"}>
                          <td style={{ padding:"13px 16px", fontSize:13, color:"var(--text-mid)" }}>{formatDate(p.createdAt)}</td>
                          <td style={{ padding:"13px 16px", fontSize:13, color:"var(--text-dark)", fontWeight:500 }}>{appt?.service || "—"}</td>
                          <td style={{ padding:"13px 16px", fontSize:14, fontWeight:700, color:"var(--teal-dark)" }}>{formatINR(p.amount)}</td>
                          <td style={{ padding:"13px 16px", fontSize:13, color:"var(--text-mid)", textTransform:"capitalize" }}>{p.method}</td>
                          <td style={{ padding:"13px 16px" }}>
                            <span style={{ padding:"4px 12px", borderRadius:50, fontSize:11, fontWeight:600, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
                              {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {showModal && (
            <AddPaymentModal
              appointments={appointments}
              patients={patients}
              onClose={() => setShowModal(false)}
              onAdded={loadAll}
            />
          )}
        </>
      )}
    </Layout>
  );
}
