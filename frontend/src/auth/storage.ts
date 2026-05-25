export const authStorageKey = "prism.jwt";
export const authChangedEvent = "prism-auth-changed";

export function getStoredToken(): string | null {
  return window.localStorage.getItem(authStorageKey);
}

export function setStoredToken(token: string): void {
  window.localStorage.setItem(authStorageKey, token);
  window.dispatchEvent(new Event(authChangedEvent));
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(authStorageKey);
  window.dispatchEvent(new Event(authChangedEvent));
}

