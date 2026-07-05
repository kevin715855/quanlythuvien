import type { AuthGateway } from "../../application/ports/auth.gateway";
import type { LoginInput, Session, User } from "../../domain/auth";
import type { HttpClient } from "../http/http-client";

export class HttpAuthGateway implements AuthGateway {
  constructor(private readonly client: HttpClient) {}
  login(input: LoginInput) { return this.client.post<Session>("/auth/login", input, false); }
  me() { return this.client.get<User>("/auth/me"); }
  async logout() { await this.client.post<unknown>("/auth/logout"); }
}
