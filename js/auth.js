/**
 * Client-only auth for static hosting (no database).
 * Real Google/Facebook/Passkey OAuth needs a backend; this demo simulates login for SRS coverage.
 */
const AUTH_STORAGE_KEY = "simplecart_user";
const ADMIN_PASSWORD = "admin123";

function loadUser() {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return null;
}

function saveUser(user) {
  if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_STORAGE_KEY);
}

function loginWithProvider(provider, displayName) {
  const user = {
    id: "user_" + Date.now(),
    name: displayName || provider + " User",
    provider,
    role: "customer",
    loggedInAt: new Date().toISOString()
  };
  saveUser(user);
  return user;
}

function loginAsAdmin(username) {
  const user = {
    id: "admin",
    name: username || "Admin",
    provider: "admin",
    role: "admin",
    loggedInAt: new Date().toISOString()
  };
  saveUser(user);
  return user;
}

function logout() {
  saveUser(null);
}

function isAdmin(user) {
  return user && user.role === "admin";
}

async function simulatePasskeyLogin() {
  if (!window.PublicKeyCredential) {
    return loginWithProvider("passkey", "Passkey User (simulated)");
  }
  return loginWithProvider("passkey", "Passkey User");
}
