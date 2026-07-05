import type { AuditFilter, AuditPage, PolicyResult, RoleDefinition, StaffAccount } from "../../domain/administration";

export interface AdministrationGateway {
  setStaffStatus(id: string, isActive: boolean): Promise<{ id: string; isActive: boolean }>;
  createStaff(input: { username: string; password: string; role: string }): Promise<StaffAccount>;
  upsertRole(code: string, input: { name?: string; permissions: string[] }): Promise<RoleDefinition>;
  updatePolicy(group: string, values: Record<string, number>): Promise<PolicyResult>;
  queryAuditLogs(filter: AuditFilter): Promise<AuditPage>;
}
