import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { getAllAppointments, updateAppointmentStatus } from "../../services/appointments";
import { getAllPublicBookings } from "../../services/publicBookings";
import { formatDate, formatDateTime, getStatusColor } from "../../utils/helpers";

const TABS = ["All","Pending","Confirmed","Completed","Cancelled"];
const SOURCE_TABS = ["All Sources","Patient Portal","Public Website"];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [publicBooks,  setPublicBooks]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("All");
  const [sourceTab, setSourceTab] = useState("All Sources");
  const [search,    setSearch]    = useState("");
  const [updating,  setUpdating]  = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [appts, pubs] = await Promise.all([
      getAllAppointments(),
      getAllPublicBookings().catch(() => []),
    ]);
    setAppointments(appts);
    setPublicBooks(pubs);
    setLoading(false);
  }

  async function handleStatus(id, status) {
    setUpdating(id);
    await updateAppointmentStatus(id, status);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setUpdating(null);
  }

  // Merge both sources
  const allItems = [
    ...appointments.map(a => ({ ...a, _source: "portal" })),
    ...publicBooks.map(b => ({ ...b, _source: "website",
      service: b.service || b.fservice || "—",
      area:    b.area    || b.farea    || "—",
      timeSlot:b.timeSlot|| b.ftime    || "—",
      date:    b.date    || b.fdate    || null,
      patientName: b.patient_name || b.fname || "—",
      patientPhone: b.phone || b.fphone || "—",
    })),
  ];

  const filtered = allItems
    .filter(a => sourceTab === "All Sources" || (sourceTab === "Patient Portal" && a._source === "portal") || (sourceTab === "Public Website" && a._source === "website"))
    .filter(a => tab === "All" || (a.status||"pending").toLowerCase() === tab.toLowerCase())
    .filter(a => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return a.service?.toLowerCase().includes(s) || a.area?.toLowerCase().includes(s) || a.patientName?.toLowerCase().includes(s) || a.patientPhone?.includes(s);
    });

  return (
    <Layout type="admin" title="Appointments">
      {/* Stats pills */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        {[["Portal",appointments.length,"#e3f2fd","#0d47a1"],["Website",publicBooks.length,"#e8f5e9","#1b5e20"],["Pending",allItems.filter(a=>(a.status||"pending")==="pending").length,"#fff8e1","#e65100"]].map(([l,v,bg,c])=>(
          <div key={l} style={{ background:bg, color:c, border:`1px solid ${c}30`, borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:600 }}>
            {l}: {v}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"var(--text-light)" }}>🔍</span>
          <input placeholder="Search service, area, patient name..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ padding:"10px 14px 10px 36px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:13, outline:"none", fontFamily:"inherit", minWidth:260, background:"white" }} />
        </div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {SOURCE_TABS.map(t => (
            <button key={t} onClick={()=>setSourceTab(t)} style={{ padding:"7px 14px", borderRadius:50, fontSize:11, fontWeight:500, border:"1.5px solid", cursor:"pointer", fontFamily:"inherit", borderColor:sourceTab===t?"var(--teal)":"var(--border)", background:sourceTab===t?"var(--teal)":"white", color:sourceTab===t?"white":"var(--text-mid)" }}>{t}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"7px 14px", borderRadius:50, fontSize:11, fontWeight:500, border:"1.5px solid", cursor:"pointer", fontFamily:"inherit", borderColor:tab===t?"#c9a84c":"var(--border)", background:tab===t?"#c9a84c":"white", color:tab===t?"white":"var(--text-mid)" }}>{t}</button>
          ))}
        </div>
        <span style={{ fontSize:12, color:"var(--text-light)", marginLeft:"auto" }}>{filtered.length} result{filtered.length!==1?"s":""}</span>
      </div>

      {/* Table */}
      <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(26,95,122,0.06)" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:60, color:"var(--text-light)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 24px" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
            <p style={{ color:"var(--text-light)", fontSize:14, fontWeight:500 }}>No data found</p>
            <p style={{ color:"var(--text-light)", fontSize:12, marginTop:4 }}>Try a different filter or search term</p>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--cream)" }}>
                  {["Source","Patient","Service","Date","Time","Area","Status","Actions"].map(h=>(
                    <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:600, color:"var(--text-light)", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"1px solid var(--border)", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a,i) => {
                  const sc = getStatusColor(a.status||"pending");
                  const isUpd = updating === a.id;
                  const isPortal = a._source === "portal";
                  return (
                    <tr key={a.id||i} style={{ borderBottom:"1px solid var(--border)" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                      onMouseLeave={e=>e.currentTarget.style.background="white"}>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:4, background:isPortal?"#e3f2fd":"#e8f5e9", color:isPortal?"#0d47a1":"#1b5e20" }}>
                          {isPortal ? "Portal" : "Website"}
                        </span>
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:12 }}>
                        <div style={{ fontWeight:600, color:"var(--text-dark)" }}>{a.patientName||"—"}</div>
                        <div style={{ color:"var(--text-light)", marginTop:1 }}>{a.patientPhone||""}</div>
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:13, fontWeight:600, color:"var(--text-dark)", maxWidth:150, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.service}</td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"var(--text-mid)", whiteSpace:"nowrap" }}>{formatDate(a.date)}</td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"var(--text-mid)", whiteSpace:"nowrap" }}>{a.timeSlot||"—"}</td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"var(--text-mid)" }}>{a.area||"—"}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ padding:"4px 10px", borderRadius:50, fontSize:10, fontWeight:600, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, whiteSpace:"nowrap" }}>
                          {(a.status||"pending").charAt(0).toUpperCase()+(a.status||"pending").slice(1)}
                        </span>
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        {isPortal ? (
                          <div style={{ display:"flex", gap:4 }}>
                            {a.status==="pending" && <button onClick={()=>handleStatus(a.id,"confirmed")} disabled={isUpd} style={{ padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:600, background:"#e3f2fd", color:"#0d47a1", border:"1px solid #90caf9", cursor:"pointer", fontFamily:"inherit" }}>✓ Confirm</button>}
                            {a.status==="confirmed" && <button onClick={()=>handleStatus(a.id,"completed")} disabled={isUpd} style={{ padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:600, background:"#e8f5e9", color:"#1b5e20", border:"1px solid #a5d6a7", cursor:"pointer", fontFamily:"inherit" }}>✓ Done</button>}
                            {(a.status==="pending"||a.status==="confirmed") && <button onClick={()=>handleStatus(a.id,"cancelled")} disabled={isUpd} style={{ padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:600, background:"#ffebee", color:"#b71c1c", border:"1px solid #ef9a9a", cursor:"pointer", fontFamily:"inherit" }}>✕</button>}
                          </div>
                        ) : (
                          <span style={{ fontSize:11, color:"var(--text-light)", fontStyle:"italic" }}>Website form</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}