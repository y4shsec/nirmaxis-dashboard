// ── Date formatting ──
export function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp?.toDate?.() || new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp?.toDate?.() || new Date(timestamp);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(timestamp) {
  return `${formatDate(timestamp)}, ${formatTime(timestamp)}`;
}

// ── Currency formatting ──
export function formatINR(amount) {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Phone number formatting ──
export function formatPhone(phone) {
  if (!phone) return "—";
  // +919876543210 → +91 98765 43210
  return phone.replace(/(\+91)(\d{5})(\d{5})/, "$1 $2 $3");
}

// ── Status badge color ──
export function getStatusColor(status) {
  const colors = {
    pending:   { bg: "#fff8e1", color: "#e65100", border: "#ffe082" },
    confirmed: { bg: "#e3f2fd", color: "#0d47a1", border: "#90caf9" },
    completed: { bg: "#e8f5e9", color: "#1b5e20", border: "#a5d6a7" },
    cancelled: { bg: "#ffebee", color: "#b71c1c", border: "#ef9a9a" },
  };
  return colors[status] || colors.pending;
}

// ── Constants ──
export const SERVICES = [
  "Neuro Physiotherapy",
  "Orthopedic Rehabilitation",
  "Sports Physiotherapy",
  "Pediatric Physiotherapy",
  "Post Surgery Rehab",
  "Geriatric Care",
  "Women's Health",
  "Home Visit General",
];

export const TIME_SLOTS = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM",
  "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
];

export const AREAS = [
  "Bodakdev", "Satellite", "Vastrapur", "Thaltej",
  "Prahlad Nagar", "Navrangpura", "Maninagar", "Paldi",
  "Ambawadi", "Nehru Nagar", "Jodhpur", "Gurukul",
  "Memnagar", "Chandkheda", "Gota", "Ranip", "Other",
];

export const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];
