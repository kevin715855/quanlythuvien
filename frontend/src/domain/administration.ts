export interface StaffAccount { id: string; username: string; role: string; isActive: boolean }
export interface RoleDefinition { code: string; name: string; permissions: string[] }
export interface PolicyResult { group: string; values: Record<string, number> }
export interface AuditLog { id: string; actorId: string | null; action: string; aggregateType: string; aggregateId: string | null; reason: string | null; details: unknown; createdAt: string }
export interface AuditPage { items: AuditLog[]; total: number; page: number; limit: number }
export interface AuditFilter { from?: string; to?: string; actorId?: string; action?: string; page: number; limit: number }
