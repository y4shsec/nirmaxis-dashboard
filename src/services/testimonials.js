import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export async function getPublishedTestimonials() {
  const q = query(
    collection(db, "testimonials"),
    where("published", "==", true),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllTestimonials() {
  const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addTestimonial(data) {
  return addDoc(collection(db, "testimonials"), {
    ...data,
    published: false,
    order: Date.now(),
    createdAt: serverTimestamp(),
  });
}

export async function updateTestimonial(id, data) {
  return updateDoc(doc(db, "testimonials", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteTestimonial(id) {
  return deleteDoc(doc(db, "testimonials", id));
}

export async function toggleTestimonial(id, published) {
  return updateDoc(doc(db, "testimonials", id), { published });
}
