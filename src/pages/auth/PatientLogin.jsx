import LoginLogo from './LoginLogo';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setupRecaptcha, sendOTP, verifyOTP } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

// ── Reusable OTP box component ──
function OTPInput({ value, onChange, onKeyDown, id, filled }) {
  return (
    <input
      id={id}
      type="tel"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{
        width: 48, height: 54,
        textAlign: "center",
        fontSize: 22, fontWeight: 700,
        border: `2px solid ${filled ? "var(--teal)" : "var(--border)"}`,
        borderRadius: 10, outline: "none",
        background: filled ? "var(--teal-light)" : "white",
        color: "var(--teal-dark)",
        transition: "all 0.15s",
      }}
    />
  );
}

export default function PatientLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role } = useAuth();
  const recaptchaRef = useRef(false);

  // "login" | "register" | "otp" | "forgot"
  const [mode, setMode] = useState(
    searchParams.get("signup") === "true" ? "register" : "login"
  );

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [otpPurpose, setOtpPurpose] = useState("login"); // "login" | "register"

  useEffect(() => {
    if (user && role === "patient") navigate("/dashboard");
    if (user && role === "admin") navigate("/admin");
  }, [user, role, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (!recaptchaRef.current) {
      setupRecaptcha("recaptcha-anchor");
      recaptchaRef.current = true;
    }
  }, []);

  // ── Send OTP (login or register) ──
  async function handleSendOTP(e, purpose = "login") {
    e.preventDefault();
    setError("");

    const cleaned = phone.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (purpose === "register" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      await sendOTP("+91" + cleaned);
      setOtpPurpose(purpose);
      setMode("otp");
      setTimer(30);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Please try again.");
      recaptchaRef.current = false;
      setupRecaptcha("recaptcha-anchor");
    } finally {
      setLoading(false);
    }
  }

  // ── Verify OTP ──
  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError("");

    const otpVal = otp.join("");
    if (otpVal.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(otpVal);

      // If registering — update name + email in Firestore
      if (otpPurpose === "register" && name.trim()) {
        const userRef = doc(db, "users", result.uid);
        await updateDoc(userRef, {
          name: name.trim(),
          email: email.trim(),
          updatedAt: serverTimestamp(),
        });
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid OTP. Please check and try again.");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  }

  // ── OTP box handlers ──
  function handleOtpChange(i, val) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  }

  function handleOtpKey(i, e) {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      document.getElementById(`otp-${i - 1}`)?.focus();
  }

  function resetToMode(m) {
    setError("");
    setOtp(["", "", "", "", "", ""]);
    recaptchaRef.current = false;
    setTimeout(() => {
      setupRecaptcha("recaptcha-anchor");
      recaptchaRef.current = true;
    }, 200);
    setMode(m);
  }

  // ── Shared styles ──
  const inputStyle = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid var(--border)", borderRadius: 8,
    fontSize: 14, color: "var(--text-dark)", background: "white",
    outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  const btnStyle = {
    width: "100%", padding: "12px",
    background: "var(--teal)", color: "white",
    border: "none", borderRadius: 8,
    fontSize: 15, fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    fontFamily: "inherit",
    transition: "background 0.2s",
  };

  return (
    <div className="auth-page">
      {/* Hidden reCAPTCHA anchor */}
      <div id="recaptcha-anchor" style={{ position: "absolute", bottom: 0, left: 0 }} />

      <div className="auth-card" style={{ maxWidth: 440 }}>

        {/* Logo */}
        <LoginLogo subtitle="NEURO & ORTHO REHABILITATION" />
        <div style={{ fontSize: 10, color: "var(--text-light)", letterSpacing: 2, marginTop: 2 }}>
          NEURO & ORTHO REHABILITATION
        </div>

        {/* ════════ LOGIN MODE ════════ */}
        {mode === "login" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--teal-dark)", marginBottom: 4 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 24 }}>
              Enter your mobile number to continue
            </p>

            <form onSubmit={(e) => handleSendOTP(e, "login")}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Mobile Number
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{
                    padding: "11px 14px", border: "1.5px solid var(--border)",
                    borderRadius: 8, background: "#f8f8f8",
                    fontSize: 14, color: "var(--text-mid)", whiteSpace: "nowrap"
                  }}>
                    🇮🇳 +91
                  </div>
                  <input
                    style={inputStyle}
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>

              {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 13 }}>
              <span style={{ color: "var(--text-light)" }}>New patient? </span>
              <button onClick={() => resetToMode("register")}
                style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                Create account
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button onClick={() => resetToMode("forgot")}
                style={{ background: "none", border: "none", color: "var(--text-light)", fontSize: 12, cursor: "pointer" }}>
                Changed your number?
              </button>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: 20, paddingTop: 16, textAlign: "center" }}>
              <a href="/admin/login" style={{ fontSize: 12, color: "var(--text-light)" }}>
                🔒 Admin / Staff Login
              </a>
            </div>
          </>
        )}

        {/* ════════ REGISTER MODE ════════ */}
        {mode === "register" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--teal-dark)", marginBottom: 4 }}>
              Create Account
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 24 }}>
              Join NIRMAXIS to track your recovery journey
            </p>

            <form onSubmit={(e) => handleSendOTP(e, "register")}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Full Name *
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Mobile Number *
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{
                    padding: "11px 14px", border: "1.5px solid var(--border)",
                    borderRadius: 8, background: "#f8f8f8",
                    fontSize: 14, color: "var(--text-mid)", whiteSpace: "nowrap"
                  }}>
                    🇮🇳 +91
                  </div>
                  <input
                    style={inputStyle}
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Email <span style={{ color: "var(--text-light)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? "Sending OTP..." : "Continue →"}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 13 }}>
              <span style={{ color: "var(--text-light)" }}>Already have an account? </span>
              <button onClick={() => resetToMode("login")}
                style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                Login
              </button>
            </div>
          </>
        )}

        {/* ════════ OTP MODE ════════ */}
        {mode === "otp" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--teal-dark)", marginBottom: 4 }}>
              Verify OTP
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 24 }}>
              6-digit OTP sent to{" "}
              <strong style={{ color: "var(--teal-dark)" }}>+91 {phone}</strong>
            </p>

            <form onSubmit={handleVerifyOTP}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                  Enter OTP
                </label>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {otp.map((d, i) => (
                    <OTPInput
                      key={i} id={`otp-${i}`} value={d} filled={!!d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                    />
                  ))}
                </div>
              </div>

              {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>}

              <button
                type="submit"
                style={{ ...btnStyle, opacity: (loading || otp.join("").length !== 6) ? 0.6 : 1 }}
                disabled={loading || otp.join("").length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Continue →"}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center", fontSize: 13 }}>
              {timer > 0 ? (
                <p style={{ color: "var(--text-light)" }}>
                  Resend in <strong style={{ color: "var(--teal)" }}>{timer}s</strong>
                </p>
              ) : (
                <button
                  onClick={() => resetToMode(otpPurpose === "register" ? "register" : "login")}
                  style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
                >
                  ← Go back / Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        {/* ════════ FORGOT MODE ════════ */}
        {mode === "forgot" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--teal-dark)", marginBottom: 4 }}>
              Update Phone Number
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 24 }}>
              Verify your new number via OTP to update your account
            </p>

            <form onSubmit={(e) => handleSendOTP(e, "login")}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  New Mobile Number
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{
                    padding: "11px 14px", border: "1.5px solid var(--border)",
                    borderRadius: 8, background: "#f8f8f8",
                    fontSize: 14, color: "var(--text-mid)", whiteSpace: "nowrap"
                  }}>
                    🇮🇳 +91
                  </div>
                  <input
                    style={inputStyle}
                    type="tel"
                    placeholder="New 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>

              <div style={{
                padding: "10px 14px", background: "#fff8e1",
                borderRadius: 8, fontSize: 12, color: "#e65100",
                border: "1px solid #ffe082", marginBottom: 16
              }}>
                ℹ️ OTP will be sent to your new number. Once verified, your account will be updated.
              </div>

              {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP to New Number →"}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button onClick={() => resetToMode("login")}
                style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                ← Back to Login
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}