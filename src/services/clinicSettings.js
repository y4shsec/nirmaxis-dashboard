import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function getClinicStats() {
  try {
    const snap = await getDoc(doc(db, "settings", "clinic"));
    if (snap.exists()) return snap.data();
  } catch (_) {}
  return null;
}

export async function updateClinicStats(data) {
  await setDoc(doc(db, "settings", "clinic"), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
