import type { AuditFilter, AuditPage, PolicyResult, RoleDefinition, StaffAccount } from "../../domain/administration";

export interface AdministrationGateway {
  createStaff(input: { username: string; password: string; role: string }): Promise<StaffAccount>;
  upsertRole(code: string, input: { name?: string; permissions: string[] }): Promise<RoleDefinition>;
  updatePolicy(group: string, values: Record<string, number>): Promise<PolicyResult>;
  queryAuditLogs(filter: AuditFilter): Promise<AuditPage>;
}
