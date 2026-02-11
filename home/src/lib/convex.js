import { ConvexClient } from 'convex/browser';

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error('VITE_CONVEX_URL environment variable is not set');
}

export const convex = new ConvexClient(CONVEX_URL || '');

export const SESSION_KEY = 'thots_session';

export function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(sessionId) {
  localStorage.setItem(SESSION_KEY, sessionId);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function validateSession(sessionId) {
  if (!sessionId) return { valid: false };
  try {
    return await convex.query('validateSession', { sessionId });
  } catch (e) {
    return { valid: false };
  }
}
