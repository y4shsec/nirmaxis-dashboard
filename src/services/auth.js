import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// ── Setup reCAPTCHA ──
export function setupRecaptcha(containerId) {
  // Clear existing verifier
  if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear(); } catch (e) {}
    window.recaptchaVerifier = null;
  }

  // Remove and recreate the container div to avoid duplicate widget error
  const existing = document.getElementById(containerId);
  if (existing) existing.innerHTML = "";

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {},
    "expired-callback": () => {
      window.recaptchaVerifier = null;
    },
  });

  return window.recaptchaVerifier;
}

// ── PATIENT: Send OTP ──
export async function sendOTP(phoneNumber) {
  // Ensure verifier exists
  if (!window.recaptchaVerifier) {
    setupRecaptcha("recaptcha-anchor");
  }

  try {
    const confirmation = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );
    window.confirmationResult = confirmation;
    return confirmation;
  } catch (err) {
    // Reset verifier on failure so next attempt works
    window.recaptchaVerifier = null;
    throw err;
  }
}

// ── PATIENT: Verify OTP ──
export async function verifyOTP(otp) {
  if (!window.confirmationResult) {
    throw new Error("No OTP session found. Please request OTP again.");
  }

  const result = await window.confirmationResult.confirm(otp);
  const user = result.user;

  // Create user doc if first time
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      phone: user.phoneNumber,
      name: "",
      email: "",
      role: "patient",
      address: "",
      area: "",
      createdAt: serverTimestamp(),
    });
  }

  return result.user;
}

// ── ADMIN: Email + Password login ──
export async function adminLogin(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    await signOut(auth);
    throw new Error("Access denied. Not an admin account.");
  }

  return result.user;
}

// ── Logout ──
export function logout() {
  return signOut(auth);
}

// ── Get current user role ──
export async function getUserRole(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return userSnap.data().role;
  return null;
}

// ── Auth state listener ──
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}