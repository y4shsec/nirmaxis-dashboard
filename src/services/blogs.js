import {
  collection, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, doc, query, orderBy, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COLL = "blogs";

export async function createBlog(data) {
  const ref = await addDoc(collection(db, COLL), {
    ...data,
    published: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllBlogs() {
  const q = query(collection(db, COLL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPublishedBlogs() {
  const q = query(collection(db, COLL), where("published", "==", true), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getBlog(id) {
  const snap = await getDoc(doc(db, COLL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateBlog(id, data) {
  await updateDoc(doc(db, COLL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function togglePublish(id, published) {
  await updateDoc(doc(db, COLL, id), { published, updatedAt: serverTimestamp() });
}

export async function deleteBlog(id) {
  await deleteDoc(doc(db, COLL, id));
}