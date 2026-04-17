import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { getAllAppointments } from "../../services/appointments";
import { getAllPatients } from "../../services/patients";
import { getAllPayments } from "../../services/payments";
import { formatDate, formatINR, getStatusColor } from "../../utils/helpers";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

function StatCard({ icon, label, value, sub, color = "#1a5f7a", trend }) {
  return (
    <div style={{
      background: "white", border: "1px solid var(--border)",
      borderRadius: 16, padding: "22px 24px",
      boxShadow: "0 2px 16px rgba(26,95,122,0.07)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "16px 16px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "var(--teal-dark)", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 8 }}>{sub}</div>}
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{icon}</div>
      </div>
      {trend && (
        <div style={{ marginTop: 12, fontSize: 12, color: trend > 0 ? "#2e7d32" : "#e53935", fontWeight: 600 }}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% this month
        </div>
      )}
    </div>
  );
}

function MiniCalendar({ appointments }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear]   = useState(today.getFullYear());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Which days have appointments
  const apptDays = new Set(
    appointments
      .filter(a => {
        const d = a.date?.toDate?.() || new Date(a.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .map(a => (a.date?.toDate?.() || new Date(a.date)).getDate())
  );

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(26,95,122,0.07)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, var(--teal-dark), var(--teal))", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }}
          style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 14 }}>‹</button>
        <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{monthNames[month]} {year}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }}
          style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 14 }}>›</button>
      </div>
      {/* Days header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "10px 12px 0" }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: "var(--text-light)", padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "4px 12px 12px", gap: 2 }}>
        {cells.map((day, i) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasAppt = day && apptDays.has(day);
          return (
            <div key={i} style={{
              height: 32, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              borderRadius: 8, fontSize: 12, fontWeight: isToday ? 700 : 400,
              background: isToday ? "var(--teal)" : "transparent",
              color: isToday ? "white" : day ? "var(--text-dark)" : "transparent",
              position: "relative",
            }}>
              {day}
              {hasAppt && !isToday && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", position: "absolute", bottom: 3 }} />}
              {hasAppt && isToday && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.7)", position: "absolute", bottom: 3 }} />}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "8px 16px 14px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-light)", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)" }} />
          Days with appointments
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [payments,     setPayments]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      const [appts, pats, pays] = await Promise.all([getAllAppointments(), getAllPatients(), getAllPayments()]);
      setAppointments(appts); setPatients(pats); setPayments(pays); setLoading(false);
    }
    load();
  }, []);

  const pending   = appointments.filter(a => a.status === "pending").length;
  const todayStr  = new Date().toDateString();
  const todayAppts = appointments.filter(a => { const d = a.date?.toDate?.() || new Date(a.date); return d.toDateString() === todayStr; });
  const totalRevenue = payments.filter(p => p.status === "paid").reduce((s,p) => s + (p.amount||0), 0);

  // Monthly revenue for chart
  const monthly = {};
  payments.forEach(p => {
    if (p.status !== "paid") return;
    const d = p.createdAt?.toDate?.() || new Date();
    const k = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    monthly[k] = (monthly[k]||0) + (p.amount||0);
  });
  const revenueData = Object.entries(monthly).map(([month,revenue]) => ({ month, revenue }));

  // Monthly patients joined
  const patientMonthly = {};
  patients.forEach(p => {
    const d = p.createdAt?.toDate?.() || new Date();
    const k = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    patientMonthly[k] = (patientMonthly[k]||0) + 1;
  });
  const patientData = Object.entries(patientMonthly).map(([month,count]) => ({ month, count }));

  // Today appointments by time
  const timeData = todayAppts.reduce((acc, a) => {
    const t = a.timeSlot || "Unknown";
    acc[t] = (acc[t]||0) + 1;
    return acc;
  }, {});
  const todayChartData = Object.entries(timeData).map(([time,count]) => ({ time, count }));

  return (
    <Layout type="admin" title="Dashboard">
      {loading ? (
        <div style={{ textAlign:"center", padding:80, color:"var(--text-light)" }}>Loading...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
            <StatCard icon="👥" label="Total Patients"     value={patients.length}        sub="Registered" color="#1a5f7a" />
            <StatCard icon="📋" label="Total Appointments" value={appointments.length}    sub={`${pending} pending`} color="#c9a84c" />
            <StatCard icon="📅" label="Today's Sessions"   value={todayAppts.length}      sub="Scheduled today" color="#2e7d32" />
            <StatCard icon="💰" label="Revenue Collected"  value={formatINR(totalRevenue)} sub="Paid sessions" color="#1565c0" />
          </div>

          {/* Row 2: Revenue chart + Calendar */}
          <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:20, marginBottom:20 }}>
            {/* Revenue chart */}
            <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 16px rgba(26,95,122,0.07)" }}>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--teal-dark)", marginBottom:20 }}>💰 Revenue Overview</div>
              {revenueData.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text-light)", fontSize:13 }}>No payment data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#1a5f7a" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1a5f7a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0"/>
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:"#7a7a9a" }}/>
                    <YAxis tick={{ fontSize:11, fill:"#7a7a9a" }} tickFormatter={v=>`₹${v}`}/>
                    <Tooltip formatter={v=>[`₹${v}`,"Revenue"]}/>
                    <Area type="monotone" dataKey="revenue" stroke="#1a5f7a" strokeWidth={2.5} fill="url(#rg)"/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Calendar */}
            <MiniCalendar appointments={appointments} />
          </div>

          {/* Row 3: Patient growth + Today's appointments */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            {/* Patient growth */}
            <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 16px rgba(26,95,122,0.07)" }}>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--teal-dark)", marginBottom:20 }}>👥 Patient Growth</div>
              {patientData.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text-light)", fontSize:13 }}>No patient data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={patientData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0"/>
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:"#7a7a9a" }}/>
                    <YAxis tick={{ fontSize:11, fill:"#7a7a9a" }}/>
                    <Tooltip/>
                    <Line type="monotone" dataKey="count" stroke="#c9a84c" strokeWidth={2.5} dot={{ fill:"#c9a84c", r:4 }}/>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Today's appointments */}
            <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 16px rgba(26,95,122,0.07)" }}>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--teal-dark)", marginBottom:16 }}>📅 Today's Appointments ({todayAppts.length})</div>
              {todayAppts.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text-light)", fontSize:13 }}>No appointments today 🎉</div>
              ) : todayChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={todayChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0"/>
                    <XAxis dataKey="time" tick={{ fontSize:9, fill:"#7a7a9a" }}/>
                    <YAxis tick={{ fontSize:11, fill:"#7a7a9a" }} allowDecimals={false}/>
                    <Tooltip/>
                    <Bar dataKey="count" fill="#2e7d32" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>

          {/* Recent appointments table */}
          <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 16px rgba(26,95,122,0.07)" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontSize:15, fontWeight:600, color:"var(--teal-dark)" }}>📋 Recent Appointments</span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"var(--cream)" }}>
                    {["Service","Date","Time","Area","Status"].map(h => (
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"var(--text-light)", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0,6).map(a => {
                    const sc = getStatusColor(a.status);
                    return (
                      <tr key={a.id} style={{ borderBottom:"1px solid var(--border)" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                        onMouseLeave={e=>e.currentTarget.style.background="white"}>
                        <td style={{ padding:"13px 16px", fontSize:13, fontWeight:500, color:"var(--text-dark)" }}>{a.service}</td>
                        <td style={{ padding:"13px 16px", fontSize:13, color:"var(--text-mid)" }}>{formatDate(a.date)}</td>
                        <td style={{ padding:"13px 16px", fontSize:13, color:"var(--text-mid)" }}>{a.timeSlot}</td>
                        <td style={{ padding:"13px 16px", fontSize:13, color:"var(--text-mid)" }}>{a.area||"—"}</td>
                        <td style={{ padding:"13px 16px" }}>
                          <span style={{ padding:"4px 12px", borderRadius:50, fontSize:11, fontWeight:600, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
                            {a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}