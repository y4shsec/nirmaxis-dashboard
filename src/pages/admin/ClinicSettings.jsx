import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { getClinicStats, updateClinicStats } from "../../services/clinicSettings";

const FIELDS = [
  { key:"patientsCount",   label:"Patients Healed",  placeholder:"e.g. 500+",     group:"stats" },
  { key:"yearsExperience", label:"Years Experience", placeholder:"e.g. 8+",       group:"stats" },
  { key:"successRate",     label:"Success Rate",     placeholder:"e.g. 98%",      group:"stats" },
  { key:"therapistsCount", label:"Expert Therapists",placeholder:"e.g. 5",        group:"stats" },
  { key:"doctorName",      label:"Doctor Name",      placeholder:"Dr. Nirma Sankhla", group:"info" },
  { key:"qualification",   label:"Qualification",    placeholder:"BPT",           group:"info" },
  { key:"phone",           label:"Phone",            placeholder:"+91 8488051503",group:"info" },
  { key:"email",           label:"Email",            placeholder:"nirmasankhla@gmail.com", group:"info" },
  { key:"city",            label:"City",             placeholder:"Ahmedabad",     group:"info" },
  { key:"workingHours",    label:"Working Hours",    placeholder:"7 AM – 8 PM, All Days", group:"info", wide:true },
  { key:"instagramUrl",    label:"Instagram URL",    placeholder:"https://instagram.com/...", group:"social", wide:true },
  { key:"linkedinUrl",     label:"LinkedIn URL",     placeholder:"https://linkedin.com/...", group:"social", wide:true },
  { key:"whatsappNumber",  label:"WhatsApp Number",  placeholder:"918488051503",  group:"social", wide:true },
];

export default function AdminClinicSettings() {
  const [form,    setForm]    = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getClinicStats().then(data => {
      if (data) setForm(data);
      setLoading(false);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await updateClinicStats(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Failed to save settings."); }
    finally { setSaving(false); }
  }

  const inp = { width:"100%", padding:"10px 14px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", background:"white" };

  const renderGroup = (title, group) => {
    const fields = FIELDS.filter(f => f.group === group);
    return (
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"var(--teal-dark)", marginBottom:12, paddingBottom:8, borderBottom:"1px solid var(--border)" }}>{title}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {fields.map(f => (
            <div key={f.key} style={{ gridColumn: f.wide ? "1/-1" : "auto" }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6 }}>{f.label}</label>
              <input style={inp} type="text" placeholder={f.placeholder} value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout type="admin" title="Clinic Settings">
      {loading ? <div style={{ textAlign:"center", padding:60, color:"var(--text-light)" }}>Loading...</div> : (
        <div style={{ maxWidth:640 }}>
          <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(26,95,122,0.06)" }}>
            <div style={{ background:"linear-gradient(135deg,#0d3d52,#1a5f7a)", padding:"18px 24px" }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"white" }}>Clinic Configuration</h3>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:4 }}>
                Stats shown on landing page — all other info used across the site
              </p>
            </div>
            <form onSubmit={handleSave} style={{ padding:24 }}>
              {renderGroup("Landing Page Statistics", "stats")}
              {renderGroup("Clinic Information", "info")}
              {renderGroup("Social & Contact Links", "social")}
              {error && <p style={{ color:"#e53935", fontSize:13, marginBottom:12 }}>{error}</p>}
              {saved && (
                <div style={{ background:"#e8f5e9", color:"#2e7d32", border:"1px solid #a5d6a7", borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:600, marginBottom:12, textAlign:"center" }}>
                  ✅ Settings saved successfully!
                </div>
              )}
              <button type="submit" disabled={saving} style={{ width:"100%", padding:"12px", background:"var(--teal)", color:"white", border:"none", borderRadius:8, fontSize:15, fontWeight:600, cursor:saving?"not-allowed":"pointer", opacity:saving?0.7:1, fontFamily:"inherit" }}>
                {saving ? "Saving..." : "Save All Settings"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
