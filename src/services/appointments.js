import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COLL = "appointments";

// ── Create new appointment ──
export async function createAppointment(data) {
  const ref = await addDoc(collection(db, COLL), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ── Get appointments for a specific patient ──
export async function getPatientAppointments(patientId) {
  const q = query(
    collection(db, COLL),
    where("patientId", "==", patientId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Get ALL appointments (admin) ──
export async function getAllAppointments() {
  const q = query(collection(db, COLL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Update appointment status ──
export async function updateAppointmentStatus(appointmentId, status) {
  const ref = doc(db, COLL, appointmentId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

// ── Update appointment details ──
export async function updateAppointment(appointmentId, data) {
  const ref = doc(db, COLL, appointmentId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// ── Get single appointment ──
export async function getAppointment(appointmentId) {
  const ref = doc(db, COLL, appointmentId);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

// ── Get appointments by status (admin) ──
export async function getAppointmentsByStatus(status) {
  const q = query(
    collection(db, COLL),
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
