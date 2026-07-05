import type { ReadersGateway } from "../../application/ports/library.gateways";
import type { Reader, RegisterReaderInput, UpdateReaderInput } from "../../domain/reader";
import type { HttpClient } from "../http/http-client";

export class HttpReadersGateway implements ReadersGateway {
  constructor(private readonly client: HttpClient) {}
  register(input: RegisterReaderInput) { return this.client.post<Reader>("/readers", input); }
  get(readerId: string) { return this.client.get<Reader>(`/readers/${encodeURIComponent(readerId)}`); }
  update(readerId: string, input: UpdateReaderInput) {
    return this.client.patch<Reader>(`/readers/${encodeURIComponent(readerId)}`, input);
  }
  renew(readerId: string, validityMonths?: number) {
    return this.client.post<Reader>(`/readers/${encodeURIComponent(readerId)}/renew`, { validityMonths });
  }
  changeCardStatus(readerId: string, action: "LOCK" | "UNLOCK", reason: string) {
    return this.client.post<Reader>(
      `/readers/${encodeURIComponent(readerId)}/${action.toLowerCase()}`,
      { reason },
    );
  }
}
