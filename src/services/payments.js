import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Add payment record ──
export async function addPayment(data) {
  const ref = await addDoc(collection(db, "payments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ── Get all payments (admin — for revenue) ──
export async function getAllPayments() {
  const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Get payments for a patient ──
export async function getPatientPayments(patientId) {
  const q = query(
    collection(db, "payments"),
    where("patientId", "==", patientId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Get revenue summary for charts ──
export async function getRevenueByMonth() {
  const payments = await getAllPayments();
  const monthly = {};

  payments.forEach((p) => {
    if (p.status !== "paid") return;
    const date = p.createdAt?.toDate?.() || new Date();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + p.amount;
  });

  // Return sorted array for Recharts
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));
}
