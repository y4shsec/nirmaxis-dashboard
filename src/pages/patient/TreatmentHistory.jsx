import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import { useAuth } from "../../context/AuthContext";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { formatDate } from "../../utils/helpers";

export default function TreatmentHistory() {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const q = query(
        collection(db, "treatments"),
        where("patientId", "==", user.uid),
        orderBy("date", "desc")
      );
      const snap = await getDocs(q);
      setTreatments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <Layout type="patient" title="Treatment History">
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-light)" }}>Loading...</div>
      ) : treatments.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: "white", borderRadius: 14, border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📂</div>
          <p style={{ color: "var(--text-light)", fontSize: 14 }}>No treatment records yet.</p>
          <p style={{ color: "var(--text-light)", fontSize: 13, marginTop: 6 }}>
            Your treatment history will appear here after your sessions.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {treatments.map((t, i) => (
            <div key={t.id} style={{
              background: "white", border: "1px solid var(--border)",
              borderRadius: 14, padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(26,95,122,0.05)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--teal-dark)" }}>
                    Session #{t.sessionNumber || (treatments.length - i)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 3 }}>
                    📅 {formatDate(t.date)}
                  </div>
                </div>
                <span style={{
                  background: "var(--teal-light)", color: "var(--teal-dark)",
                  padding: "4px 12px", borderRadius: 50, fontSize: 12, fontWeight: 600,
                }}>Completed</span>
              </div>
              {t.clinicalNotes && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-light)", marginBottom: 4 }}>
                    CLINICAL NOTES
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-dark)", lineHeight: 1.6 }}>{t.clinicalNotes}</p>
                </div>
              )}
              {t.exercisesPrescribed?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-light)", marginBottom: 8 }}>
                    EXERCISES PRESCRIBED
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {t.exercisesPrescribed.map((ex, idx) => (
                      <span key={idx} style={{
                        background: "var(--cream)", color: "var(--text-dark)",
                        padding: "4px 12px", borderRadius: 50,
                        fontSize: 12, border: "1px solid var(--border)",
                      }}>{ex}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
