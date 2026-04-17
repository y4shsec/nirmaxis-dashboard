import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { getAllPatients } from "../../services/patients";
import { getPatientAppointments } from "../../services/appointments";
import { formatDate } from "../../utils/helpers";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function PatientModal({ patient, onClose }) {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientAppointments(patient.uid).then(data => { setAppts(data); setLoading(false); });
  }, [patient.uid]);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:18, width:"100%", maxWidth:560, maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg, var(--teal-dark), var(--teal))", padding:"22px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:700, color:"var(--teal-dark)" }}>
              {patient.name?.[0]?.toUpperCase() || "P"}
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:"white" }}>{patient.name || "Unnamed Patient"}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{patient.phone}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:34, height:34, borderRadius:"50%", fontSize:20, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ overflowY:"auto", flex:1 }}>
          <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[["Email",patient.email||"—"],["Area",patient.area||"—"],["Phone",patient.phone||"—"],["Joined",formatDate(patient.createdAt)],["Address",patient.address||"—"]].map(([l,v])=>(
                <div key={l}>
                  <div style={{ fontSize:10, color:"var(--text-light)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:14, color:"var(--text-dark)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding:"20px 24px" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--teal-dark)", marginBottom:12 }}>Appointment History ({appts.length})</div>
            {loading ? <p style={{ color:"var(--text-light)", fontSize:13 }}>Loading...</p> :
             appts.length === 0 ? <p style={{ color:"var(--text-light)", fontSize:13 }}>No appointments yet.</p> : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {appts.map(a=>(
                  <div key={a.id} style={{ padding:"10px 14px", background:"var(--cream)", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500 }}>{a.service}</div>
                      <div style={{ fontSize:11, color:"var(--text-light)", marginTop:2 }}>{formatDate(a.date)} · {a.timeSlot}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color: a.status==="completed"?"#2e7d32":a.status==="cancelled"?"#b71c1c":"#0d47a1" }}>
                      {a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { getAllPatients().then(d => { setPatients(d); setLoading(false); }); }, []);

  const filtered = patients.filter(p => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return p.name?.toLowerCase().includes(s) || p.phone?.includes(s) || p.area?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s);
  });

  function exportExcel() {
    const data = patients.map(p => ({
      Name:    p.name    || "",
      Phone:   p.phone   || "",
      Email:   p.email   || "",
      Area:    p.area    || "",
      Address: p.address || "",
      Joined:  formatDate(p.createdAt),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    const buf = XLSX.write(wb, { bookType:"xlsx", type:"array" });
    saveAs(new Blob([buf], { type:"application/octet-stream" }), "NIRMAXIS_Patients.xlsx");
  }

  return (
    <Layout type="admin" title="Patients">
      {selected && <PatientModal patient={selected} onClose={() => setSelected(null)} />}

      {/* Toolbar */}
      <div style={{ display:"flex", gap:12, marginBottom:20, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, maxWidth:380 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"var(--text-light)" }}>🔍</span>
          <input
            placeholder="Search by name, phone, area, email..."
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:"100%", padding:"10px 14px 10px 36px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:13, outline:"none", fontFamily:"inherit", background:"white" }}
          />
        </div>
        <span style={{ fontSize:13, color:"var(--text-light)" }}>{filtered.length} patient{filtered.length!==1?"s":""}</span>
        <button onClick={exportExcel} style={{
          display:"flex", alignItems:"center", gap:8,
          background:"#e8f5e9", color:"#1b5e20", border:"1px solid #a5d6a7",
          borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:600,
          cursor:"pointer", fontFamily:"inherit",
        }}>
          📥 Export Excel
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--text-light)" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 24px", background:"white", borderRadius:14, border:"1px solid var(--border)" }}>
          <div style={{ fontSize:44, marginBottom:10 }}>👥</div>
          <p style={{ color:"var(--text-light)", fontSize:14 }}>No patients found.</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={()=>setSelected(p)} style={{
              background:"white", border:"1px solid var(--border)",
              borderRadius:14, padding:"18px 20px", cursor:"pointer",
              boxShadow:"0 2px 12px rgba(26,95,122,0.06)",
              transition:"all 0.18s", position:"relative", overflow:"hidden",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--teal)";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(26,95,122,0.14)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 12px rgba(26,95,122,0.06)";}}>
              {/* Top accent */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg, var(--teal), var(--teal-light))", borderRadius:"14px 14px 0 0" }}/>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <div style={{
                  width:44, height:44, borderRadius:"50%",
                  background:"linear-gradient(135deg, var(--teal-dark), var(--teal))",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:17, fontWeight:700, color:"white", flexShrink:0,
                }}>
                  {p.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div style={{ overflow:"hidden" }}>
                  <div style={{ fontSize:14, fontWeight:600, color:"var(--text-dark)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name||"Unnamed"}</div>
                  <div style={{ fontSize:12, color:"var(--text-light)", marginTop:1 }}>{p.phone}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {p.area && <span style={{ fontSize:11, background:"var(--cream)", border:"1px solid var(--border)", borderRadius:50, padding:"3px 10px", color:"var(--text-mid)" }}>📍 {p.area}</span>}
                {p.email && <span style={{ fontSize:11, background:"var(--cream)", border:"1px solid var(--border)", borderRadius:50, padding:"3px 10px", color:"var(--text-mid)" }}>✉️ Email</span>}
              </div>
              <div style={{ marginTop:10, fontSize:11, color:"var(--text-light)" }}>
                Joined {formatDate(p.createdAt)} · <span style={{ color:"var(--teal)", fontWeight:600 }}>View →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}