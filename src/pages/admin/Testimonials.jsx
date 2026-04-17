import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import {
  getAllTestimonials, addTestimonial, updateTestimonial,
  deleteTestimonial, toggleTestimonial,
} from "../../services/testimonials";

function Modal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: item?.name || "", service: item?.service || "",
    review: item?.review || "", rating: item?.rating || 5,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  async function handleSave() {
    if (!form.name.trim() || !form.review.trim()) { setError("Name and review required."); return; }
    setSaving(true);
    try {
      if (item?.id) { await updateTestimonial(item.id, form); onSaved({ ...item, ...form }); }
      else { const ref = await addTestimonial(form); onSaved({ id: ref.id, ...form, published: false }); }
      onClose();
    } catch { setError("Failed to save."); }
    finally { setSaving(false); }
  }

  const inp = { width:"100%", padding:"10px 14px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", background:"white" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:16, width:"100%", maxWidth:480, overflow:"hidden", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#0d3d52,#1a5f7a)", padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:15, fontWeight:700, color:"white" }}>{item?.id ? "Edit Review" : "Add Review"}</span>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:30, height:30, borderRadius:"50%", fontSize:18, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ padding:24 }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6 }}>Patient Name *</label>
            <input style={inp} type="text" placeholder="Patient's name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6 }}>Service / Treatment</label>
            <input style={inp} type="text" placeholder="e.g. Stroke Rehabilitation" value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6 }}>Rating</label>
            <div style={{ display:"flex", gap:8 }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, rating: s }))} style={{ fontSize:24, background:"none", border:"none", cursor:"pointer", color: s <= form.rating ? "#c9a84c" : "#ddd" }}>★</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6 }}>Review *</label>
            <textarea style={{ ...inp, resize:"vertical", minHeight:90 }} placeholder="Patient's feedback..." value={form.review} onChange={e => setForm(p => ({ ...p, review: e.target.value }))} />
          </div>
          {error && <p style={{ color:"#e53935", fontSize:12, marginBottom:12 }}>{error}</p>}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={onClose} style={{ padding:"10px 20px", borderRadius:8, border:"1.5px solid var(--border)", background:"white", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding:"10px 20px", borderRadius:8, background:"var(--teal)", color:"white", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", opacity:saving?0.7:1 }}>
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTestimonials() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);

  useEffect(() => { getAllTestimonials().then(d => { setItems(d); setLoading(false); }); }, []);

  function handleSaved(item) {
    setItems(prev => prev.find(t => t.id === item.id) ? prev.map(t => t.id === item.id ? item : t) : [item, ...prev]);
  }
  async function handleToggle(id, published) {
    await toggleTestimonial(id, published);
    setItems(prev => prev.map(t => t.id === id ? { ...t, published } : t));
  }
  async function handleDelete(id) {
    if (!window.confirm("Delete this review?")) return;
    await deleteTestimonial(id);
    setItems(prev => prev.filter(t => t.id !== id));
  }

  return (
    <Layout type="admin" title="Testimonials">
      <div style={{ display:"flex", gap:14, marginBottom:24, alignItems:"center", flexWrap:"wrap" }}>
        {[["⭐","Total",items.length],["✅","Published",items.filter(t=>t.published).length],["📋","Drafts",items.filter(t=>!t.published).length]].map(([icon,l,v]) => (
          <div key={l} style={{ background:"white", border:"1px solid var(--border)", borderRadius:12, padding:"14px 20px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 2px 8px rgba(26,95,122,0.05)" }}>
            <span style={{ fontSize:20 }}>{icon}</span>
            <div><div style={{ fontSize:22, fontWeight:700, color:"var(--teal-dark)", lineHeight:1 }}>{v}</div><div style={{ fontSize:11, color:"var(--text-light)", marginTop:3 }}>{l}</div></div>
          </div>
        ))}
        <button onClick={() => { setEditing(null); setShowModal(true); }} style={{ marginLeft:"auto", background:"var(--teal)", color:"white", border:"none", borderRadius:10, padding:"11px 20px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          + Add Review
        </button>
      </div>

      {loading ? <div style={{ textAlign:"center", padding:60, color:"var(--text-light)" }}>Loading...</div>
      : items.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 24px", background:"white", borderRadius:14, border:"1px solid var(--border)" }}>
          <div style={{ fontSize:44, marginBottom:12 }}>⭐</div>
          <p style={{ color:"var(--text-light)", fontSize:14, marginBottom:16 }}>No reviews yet.</p>
          <button onClick={() => setShowModal(true)} style={{ background:"var(--teal)", color:"white", border:"none", borderRadius:8, padding:"11px 22px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Add First Review</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {items.map(t => (
            <div key={t.id} style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(26,95,122,0.06)" }}>
              <div style={{ height:3, background: t.published ? "linear-gradient(90deg,var(--teal),var(--teal-light))" : "var(--border)" }} />
              <div style={{ padding:"18px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontSize:18, color:"#c9a84c", letterSpacing:2 }}>{"★".repeat(t.rating || 5)}</div>
                  <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:4, background:t.published?"#e8f5e9":"#f5f5f5", color:t.published?"#1b5e20":"#888", border:`1px solid ${t.published?"#a5d6a7":"#ddd"}` }}>
                    {t.published ? "Live" : "Draft"}
                  </span>
                </div>
                <p style={{ fontSize:13, color:"var(--text-mid)", lineHeight:1.6, marginBottom:12, fontStyle:"italic" }}>"{t.review}"</p>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--teal-dark)" }}>{t.name}</div>
                {t.service && <div style={{ fontSize:11, color:"var(--text-light)", marginTop:2 }}>{t.service}</div>}
                <div style={{ display:"flex", gap:8, marginTop:14 }}>
                  <button onClick={() => handleToggle(t.id, !t.published)} style={{ flex:1, padding:"7px", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", border:"1.5px solid", background:t.published?"#fff8e1":"var(--teal)", color:t.published?"#e65100":"white", borderColor:t.published?"#ffe082":"var(--teal)" }}>
                    {t.published ? "Hide" : "Publish"}
                  </button>
                  <button onClick={() => { setEditing(t); setShowModal(true); }} style={{ padding:"7px 14px", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", border:"1.5px solid var(--border)", background:"white" }}>Edit</button>
                  <button onClick={() => handleDelete(t.id)} style={{ padding:"7px 14px", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", border:"1.5px solid #ef9a9a", background:"#ffebee", color:"#b71c1c" }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && <Modal item={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={handleSaved} />}
    </Layout>
  );
}
