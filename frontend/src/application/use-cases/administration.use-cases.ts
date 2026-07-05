import type { AuditFilter } from "../../domain/administration";
import type { AdministrationGateway } from "../ports/administration.gateway";

const required = (value: string, message: string) => { const result = value.trim(); if (!result) throw new Error(message); return result; };

export class CreateStaffUseCase {
  constructor(private readonly gateway: AdministrationGateway) {}
  async execute(input: { username: string; password: string; role: string }) {
    const username = required(input.username, "Tên đăng nhập là bắt buộc").toLowerCase();
    if (input.password.length < 8) throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
    const role = required(input.role, "Vai trò là bắt buộc").toLowerCase();
    return this.gateway.createStaff({ username, password: input.password, role });
  }
}

export class UpsertRoleUseCase {
  constructor(private readonly gateway: AdministrationGateway) {}
  async execute(input: { code: string; name: string; permissionsText: string }) {
    const code = required(input.code, "Mã vai trò là bắt buộc").toLowerCase();
    const permissions = [...new Set(input.permissionsText.split(/[\n,]/).map((item) => item.trim().toLowerCase()).filter(Boolean))];
    if (!permissions.length) throw new Error("Cần ít nhất một quyền");
    const name = input.name.trim();
    return this.gateway.upsertRole(code, { ...(name ? { name } : {}), permissions });
  }
}

export class UpdatePolicyUseCase {
  constructor(private readonly gateway: AdministrationGateway) {}
  async execute(input: { group: string; valuesText: string }) {
    const group = required(input.group, "Nhóm chính sách là bắt buộc").toLowerCase();
    const values: Record<string, number> = {};
    for (const line of input.valuesText.split(/\r?\n/).filter((item) => item.trim())) {
      const [rawKey, rawValue, ...rest] = line.split("=");
      const key = rawKey?.trim(); const value = Number(rawValue?.trim());
      if (!key || rest.length || !Number.isInteger(value) || value < 0) throw new Error("Chính sách phải theo dạng key=số nguyên");
      values[key] = value;
    }
    if (!Object.keys(values).length) throw new Error("Cần ít nhất một giá trị chính sách");
    return this.gateway.updatePolicy(group, values);
  }
}

export class QueryAuditLogsUseCase {
  constructor(private readonly gateway: AdministrationGateway) {}
  execute(input: Partial<AuditFilter>) {
    const filter: AuditFilter = { page: Math.max(1, input.page ?? 1), limit: Math.min(100, Math.max(1, input.limit ?? 20)) };
    for (const key of ["from", "to", "actorId", "action"] as const) { const value = input[key]?.trim(); if (value) filter[key] = value; }
    return this.gateway.queryAuditLogs(filter);
  }
}
