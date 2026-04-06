import { useState, useCallback } from 'react';

const KEY = 'insutech_user';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* storage full or unavailable */ }
}

/**
 * Persists basic user info (name, phone, email, etc.) across sessions.
 *
 * localUser  — current stored object, or null if first visit
 * saveUser   — merge new fields into stored object
 * clearUser  — wipe stored object
 */
export default function useLocalUser() {
  const [localUser, setLocalUser] = useState(() => read());

  const saveUser = useCallback((fields) => {
    const merged = { ...read(), ...fields };
    write(merged);
    setLocalUser(merged);
  }, []);

  const clearUser = useCallback(() => {
    localStorage.removeItem(KEY);
    setLocalUser(null);
  }, []);

  return { localUser, saveUser, clearUser };
}
