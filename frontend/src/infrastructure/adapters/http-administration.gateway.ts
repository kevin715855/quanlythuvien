import type { AdministrationGateway } from "../../application/ports/administration.gateway";
import type { AuditFilter, AuditPage, PolicyResult, RoleDefinition, StaffAccount } from "../../domain/administration";
import type { HttpClient } from "../http/http-client";

export class HttpAdministrationGateway implements AdministrationGateway {
  constructor(private readonly client: HttpClient) {}
  createStaff(input: { username: string; password: string; role: string }) { return this.client.post<StaffAccount>("/admin/staff", input); }
  upsertRole(code: string, input: { name?: string; permissions: string[] }) { return this.client.put<RoleDefinition>(`/admin/roles/${encodeURIComponent(code)}`, input); }
  updatePolicy(group: string, values: Record<string, number>) { return this.client.put<PolicyResult>(`/admin/policies/${encodeURIComponent(group)}`, { values }); }
  queryAuditLogs(filter: AuditFilter) {
    const query = new URLSearchParams();
    for (const key of ["from", "to", "actorId", "action"] as const) if (filter[key]) query.set(key, filter[key]);
    query.set("page", String(filter.page)); query.set("limit", String(filter.limit));
    return this.client.get<AuditPage>(`/admin/audit-logs?${query.toString()}`);
  }
}
