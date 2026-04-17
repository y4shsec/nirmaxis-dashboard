import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// ── Save booking from public website form ──
export async function savePublicBooking(data) {
  const ref = await addDoc(collection(db, "publicBookings"), {
    ...data,
    source: "website",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ── Get all public bookings (admin) ──
export async function getAllPublicBookings() {
  const q = query(collection(db, "publicBookings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}