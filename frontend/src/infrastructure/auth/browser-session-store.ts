import type { SessionStore } from "../../application/ports/auth.gateway";
import type { Session } from "../../domain/auth";

const SESSION_KEY = "dgm-library.session";

export class BrowserSessionStore implements SessionStore {
  private readonly listeners = new Set<(session: Session | null) => void>();

  constructor(private readonly storage: Storage) {}

  get(): Session | null {
    const value = this.storage.getItem(SESSION_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as Session;
    } catch {
      this.storage.removeItem(SESSION_KEY);
      return null;
    }
  }

  save(session: Session): void {
    this.storage.setItem(SESSION_KEY, JSON.stringify(session));
    this.emit(session);
  }

  clear(): void {
    this.storage.removeItem(SESSION_KEY);
    this.emit(null);
  }

  subscribe(listener: (session: Session | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(session: Session | null) {
    this.listeners.forEach((listener) => listener(session));
  }
}
