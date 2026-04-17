import React, { useEffect, useState, useRef } from "react";
import Layout from "../../components/common/Layout";
import { getAllBlogs, createBlog, updateBlog, togglePublish, deleteBlog } from "../../services/blogs";
import { formatDate } from "../../utils/helpers";

// ── Rich text toolbar buttons ──
const TOOLBAR = [
  { cmd: "bold",          icon: "B",    title: "Bold",        style: { fontWeight: "bold" } },
  { cmd: "italic",        icon: "I",    title: "Italic",      style: { fontStyle: "italic" } },
  { cmd: "underline",     icon: "U",    title: "Underline",   style: { textDecoration: "underline" } },
  { cmd: "insertUnorderedList", icon: "≡", title: "Bullet list" },
  { cmd: "insertOrderedList",   icon: "1.", title: "Numbered list" },
  { cmd: "justifyLeft",   icon: "⬤⬤⬤", title: "Align left"   },
  { cmd: "justifyCenter", icon: "⊙",    title: "Align center" },
  { cmd: "justifyRight",  icon: "➡",    title: "Align right"  },
];

const HEADINGS = ["Paragraph","Heading 1","Heading 2","Heading 3"];

function BlogEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileRef   = useRef(null);

  function exec(cmd, val) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(editorRef.current?.innerHTML || "");
  }

  function insertImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      exec("insertHTML",
        `<img src="${ev.target.result}" style="max-width:100%;border-radius:8px;margin:12px 0;" />`
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function insertLink() {
    const url = window.prompt("Enter URL:");
    if (url) exec("createLink", url);
  }

  function onHeadingChange(e) {
    const val = e.target.value;
    if (val === "Paragraph") exec("formatBlock", "p");
    else exec("formatBlock", val === "Heading 1" ? "h1" : val === "Heading 2" ? "h2" : "h3");
  }

  return (
    <div style={{ border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 2, padding: "8px 10px", background: "var(--cream)", borderBottom: "1px solid var(--border)", flexWrap: "wrap", alignItems: "center" }}>
        {/* Heading select */}
        <select onChange={onHeadingChange} defaultValue="Paragraph"
          style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white", marginRight: 4 }}>
          {HEADINGS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>

        {TOOLBAR.map(btn => (
          <button key={btn.cmd} title={btn.title} onMouseDown={e => { e.preventDefault(); exec(btn.cmd); }}
            style={{ padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 13, fontFamily: "inherit", minWidth: 32, ...btn.style }}>
            {btn.icon}
          </button>
        ))}

        <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />

        {/* Font size */}
        <select onChange={e => exec("fontSize", e.target.value)} defaultValue="3"
          style={{ padding: "4px 6px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: "white" }}>
          {[["1","10px"],["2","13px"],["3","16px"],["4","18px"],["5","24px"],["6","32px"]].map(([v,l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        {/* Color */}
        <input type="color" title="Text color" onChange={e => exec("foreColor", e.target.value)}
          style={{ width: 28, height: 28, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", padding: 2 }} />

        <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />

        {/* Insert image */}
        <button title="Insert image" onMouseDown={e => { e.preventDefault(); fileRef.current?.click(); }}
          style={{ padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 13 }}>
          🖼️
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={insertImage} style={{ display: "none" }} />

        {/* Insert link */}
        <button title="Insert link" onMouseDown={e => { e.preventDefault(); insertLink(); }}
          style={{ padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 13 }}>
          🔗
        </button>

        {/* Horizontal rule */}
        <button title="Divider" onMouseDown={e => { e.preventDefault(); exec("insertHorizontalRule"); }}
          style={{ padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 13 }}>
          ─
        </button>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || "")}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight: 320, padding: "16px 20px",
          outline: "none", fontSize: 15, lineHeight: 1.8,
          color: "var(--text-dark)", background: "white",
          fontFamily: "'DM Sans', sans-serif",
        }}
        data-placeholder="Start writing your blog content here..."
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-light);
          pointer-events: none;
        }
        [contenteditable] img { max-width:100%; border-radius:8px; margin:12px 0; display:block; }
        [contenteditable] h1 { font-size:28px; font-family:'Cormorant Garamond',serif; color:#0d3d52; margin:16px 0 8px; }
        [contenteditable] h2 { font-size:22px; font-family:'Cormorant Garamond',serif; color:#0d3d52; margin:14px 0 6px; }
        [contenteditable] h3 { font-size:18px; font-family:'Cormorant Garamond',serif; color:#0d3d52; margin:12px 0 6px; }
        [contenteditable] p  { margin-bottom:10px; }
        [contenteditable] ul,[contenteditable] ol { padding-left:22px; margin-bottom:12px; }
        [contenteditable] blockquote { border-left:4px solid #1a5f7a; padding:10px 16px; background:#e8f4f8; border-radius:0 8px 8px 0; margin:14px 0; }
        [contenteditable] a { color:#1a5f7a; }
        [contenteditable] hr { border:none; border-top:2px solid #e8e0d0; margin:20px 0; }
      `}</style>
    </div>
  );
}

function BlogModal({ blog, onClose, onSaved }) {
  const [title,    setTitle]    = useState(blog?.title    || "");
  const [excerpt,  setExcerpt]  = useState(blog?.excerpt  || "");
  const [category, setCategory] = useState(blog?.category || "General");
  const [content,  setContent]  = useState(blog?.content  || "");
  const [tab,      setTab]      = useState("editor"); // "editor" | "docx"
  const [converting, setConverting] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const docxRef = useRef();

  async function handleDocx(e) {
    const file = e.target.files[0];
    if (!file) return;
    setConverting(true); setError("");
    try {
      // Try mammoth from window (CDN), fallback to npm import
      let mammoth = window.mammoth;
      if (!mammoth) {
        mammoth = (await import("mammoth")).default || (await import("mammoth"));
      }
      const buf = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: buf });
      setContent(result.value);
      if (!title) setTitle(file.name.replace(/\.(docx?)$/i,"").replace(/[_-]/g," "));
      setTab("editor");
    } catch(err) {
      setError("Failed to convert document. Try installing: npm install mammoth");
      console.error(err);
    } finally { setConverting(false); }
    e.target.value = "";
  }

  async function handleSave() {
    if (!title.trim()) { setError("Blog title is required."); return; }
    if (!content.trim()) { setError("Please write some content or upload a document."); return; }
    setSaving(true); setError("");
    try {
      const data = { title: title.trim(), excerpt: excerpt.trim(), category, content };
      if (blog?.id) { await updateBlog(blog.id, data); onSaved({ ...blog, ...data }); }
      else { const id = await createBlog(data); onSaved({ id, ...data, published: false }); }
      onClose();
    } catch(e) { setError("Failed to save. Please try again."); }
    finally { setSaving(false); }
  }

  const inp = { width:"100%", padding:"10px 14px", border:"1.5px solid var(--border)", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", background:"white" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:16 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:18, width:"100%", maxWidth:820, maxHeight:"95vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.25)" }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#0d3d52,#1a5f7a)", padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <span style={{ fontSize:16, fontWeight:700, color:"white" }}>{blog?.id ? "Edit Blog" : "New Blog"}</span>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:32, height:32, borderRadius:"50%", fontSize:20, cursor:"pointer" }}>×</button>
        </div>

        <div style={{ overflowY:"auto", flex:1, padding:"20px 24px" }}>
          {/* Meta fields */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6, color:"var(--text-dark)" }}>Blog Title *</label>
              <input style={inp} type="text" placeholder="Enter blog title" value={title} onChange={e=>setTitle(e.target.value)} autoFocus />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6, color:"var(--text-dark)" }}>Category</label>
              <select style={inp} value={category} onChange={e=>setCategory(e.target.value)}>
                {["General","Neuro Rehab","Ortho Tips","Patient Stories","Exercise Guide","Wellness","Pain Management"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, marginBottom:6, color:"var(--text-dark)" }}>Short Excerpt</label>
              <input style={inp} type="text" placeholder="Brief description shown on card..." value={excerpt} onChange={e=>setExcerpt(e.target.value)} />
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display:"flex", gap:0, marginBottom:12, border:"1.5px solid var(--border)", borderRadius:8, overflow:"hidden", width:"fit-content" }}>
            {[["editor","✏️ Write Content"],["docx","📄 Import from Word"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"8px 18px", fontSize:12, fontWeight:600, border:"none", cursor:"pointer", fontFamily:"inherit",
                background: tab===t ? "var(--teal)" : "white",
                color:      tab===t ? "white" : "var(--text-mid)",
              }}>{l}</button>
            ))}
          </div>

          {/* Write tab */}
          {tab === "editor" && (
            <BlogEditor value={content} onChange={setContent} />
          )}

          {/* Import Word tab */}
          {tab === "docx" && (
            <div>
              <div onClick={()=>docxRef.current?.click()} style={{
                border:"2px dashed var(--border)", borderRadius:10, padding:"32px",
                textAlign:"center", cursor:"pointer", background:"var(--cream)",
              }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--teal)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                {converting ? (
                  <p style={{ color:"var(--teal)", fontSize:14, fontWeight:600 }}>⏳ Converting document...</p>
                ) : content ? (
                  <p style={{ color:"#2e7d32", fontSize:13, fontWeight:600 }}>✅ Document imported. Switch to "Write Content" tab to edit. Click to replace.</p>
                ) : (
                  <>
                    <div style={{ fontSize:40, marginBottom:10 }}>📄</div>
                    <p style={{ fontSize:14, color:"var(--text-mid)", fontWeight:500 }}>Click to upload .docx file</p>
                    <p style={{ fontSize:12, color:"var(--text-light)", marginTop:4 }}>Word formatting + images preserved</p>
                  </>
                )}
              </div>
              <input ref={docxRef} type="file" accept=".doc,.docx" onChange={handleDocx} style={{ display:"none" }} />
              <p style={{ fontSize:12, color:"var(--text-light)", marginTop:8 }}>
                After importing, switch to "Write Content" tab to make edits or add images.
              </p>
            </div>
          )}

          {error && <p style={{ color:"var(--danger)", fontSize:13, marginTop:12 }}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 24px", borderTop:"1px solid var(--border)", display:"flex", gap:10, justifyContent:"flex-end", background:"var(--cream)", flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:"10px 22px", borderRadius:8, fontSize:13, fontWeight:600, border:"1.5px solid var(--border)", background:"white", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding:"10px 22px", borderRadius:8, fontSize:13, fontWeight:600, background:"var(--teal)", color:"white", border:"none", cursor:"pointer", fontFamily:"inherit", opacity:saving?0.7:1 }}>
            {saving ? "Saving..." : (blog?.id ? "Save Changes" : "Publish Draft")}
          </button>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ blog, onToggle, onDelete, onEdit }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    if (!window.confirm("Delete this blog permanently?")) return;
    setDeleting(true);
    await deleteBlog(blog.id);
    onDelete(blog.id);
  }
  return (
    <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(26,95,122,0.06)", transition:"all 0.18s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(26,95,122,0.12)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 12px rgba(26,95,122,0.06)";}}>
      <div style={{ height:4, background:blog.published?"linear-gradient(90deg,var(--teal),var(--teal-light))":"var(--border)" }}/>
      <div style={{ padding:"18px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:8 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"var(--teal-dark)", lineHeight:1.4 }}>{blog.title}</div>
          <span style={{ padding:"3px 10px", borderRadius:50, fontSize:10, fontWeight:700, flexShrink:0, background:blog.published?"#e8f5e9":"#f5f5f5", color:blog.published?"#1b5e20":"#888", border:`1px solid ${blog.published?"#a5d6a7":"#ddd"}` }}>
            {blog.published ? "Published" : "Draft"}
          </span>
        </div>
        {blog.excerpt && <p style={{ fontSize:12, color:"var(--text-light)", lineHeight:1.5, marginBottom:10 }}>{blog.excerpt}</p>}
        <div style={{ fontSize:11, color:"var(--text-light)", marginBottom:14 }}>📅 {formatDate(blog.createdAt)} · {blog.category}</div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>onToggle(blog.id,!blog.published)} style={{ flex:1, padding:"7px 0", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", border:"1.5px solid", background:blog.published?"#fff8e1":"var(--teal)", color:blog.published?"#e65100":"white", borderColor:blog.published?"#ffe082":"var(--teal)" }}>
            {blog.published?"Unpublish":"Publish"}
          </button>
          <button onClick={()=>onEdit(blog)} style={{ padding:"7px 14px", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", border:"1.5px solid var(--border)", background:"white", color:"var(--text-dark)" }}>Edit</button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding:"7px 14px", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", border:"1.5px solid #ef9a9a", background:"#ffebee", color:"#b71c1c" }}>{deleting?"...":"Delete"}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogs() {
  const [blogs,     setBlogs]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);

  useEffect(() => { getAllBlogs().then(d=>{setBlogs(d);setLoading(false);}); }, []);

  function handleSaved(blog) {
    setBlogs(prev => {
      const exists = prev.find(b=>b.id===blog.id);
      return exists ? prev.map(b=>b.id===blog.id?blog:b) : [blog,...prev];
    });
  }

  async function handleToggle(id, published) {
    await togglePublish(id, published);
    setBlogs(prev=>prev.map(b=>b.id===id?{...b,published}:b));
  }

  return (
    <Layout type="admin" title="Blogs">
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
        {[["📝","Total Blogs",blogs.length],["✅","Published",blogs.filter(b=>b.published).length],["📋","Drafts",blogs.filter(b=>!b.published).length]].map(([icon,label,val])=>(
          <div key={label} style={{ background:"white", border:"1px solid var(--border)", borderRadius:12, padding:"14px 20px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 2px 8px rgba(26,95,122,0.05)" }}>
            <span style={{ fontSize:20 }}>{icon}</span>
            <div><div style={{ fontSize:22, fontWeight:700, color:"var(--teal-dark)", lineHeight:1 }}>{val}</div><div style={{ fontSize:11, color:"var(--text-light)", marginTop:3 }}>{label}</div></div>
          </div>
        ))}
        <button onClick={()=>{setEditing(null);setShowModal(true);}} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8, background:"var(--teal)", color:"white", border:"none", borderRadius:10, padding:"12px 22px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          + New Blog
        </button>
      </div>

      {loading ? <div style={{ textAlign:"center", padding:60, color:"var(--text-light)" }}>Loading...</div>
      : blogs.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 24px", background:"white", borderRadius:14, border:"1px solid var(--border)" }}>
          <div style={{ fontSize:44, marginBottom:12 }}>✍️</div>
          <p style={{ color:"var(--text-light)", fontSize:14, marginBottom:16 }}>No blogs yet. Write your first article!</p>
          <button onClick={()=>setShowModal(true)} style={{ background:"var(--teal)", color:"white", border:"none", borderRadius:8, padding:"11px 22px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Write First Blog</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {blogs.map(b=>(
            <BlogCard key={b.id} blog={b} onToggle={handleToggle} onDelete={id=>setBlogs(prev=>prev.filter(b=>b.id!==id))} onEdit={blog=>{setEditing(blog);setShowModal(true);}} />
          ))}
        </div>
      )}

      {showModal && <BlogModal blog={editing} onClose={()=>{setShowModal(false);setEditing(null);}} onSaved={handleSaved} />}
    </Layout>
  );
}