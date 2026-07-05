import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdministrationGateway } from "../ports/administration.gateway";
import { CreateStaffUseCase, QueryAuditLogsUseCase, UpdatePolicyUseCase, UpsertRoleUseCase } from "./administration.use-cases";

describe("Administration use cases", () => {
  let gateway: AdministrationGateway;
  beforeEach(() => {
    gateway = { createStaff: vi.fn(), setStaffStatus: vi.fn(), upsertRole: vi.fn(), updatePolicy: vi.fn(), queryAuditLogs: vi.fn() };
  });

  it("normalizes staff account input", async () => {
    await new CreateStaffUseCase(gateway).execute({ username: " Librarian ", password: "secret123", role: " Staff " });
    expect(gateway.createStaff).toHaveBeenCalledWith({ username: "librarian", password: "secret123", role: "staff" });
  });

  it("normalizes unique role permissions", async () => {
    await new UpsertRoleUseCase(gateway).execute({ code: " Manager ", name: " Quản lý ", permissionsText: "reports.read\nreports.read, policies.write" });
    expect(gateway.upsertRole).toHaveBeenCalledWith("manager", { name: "Quản lý", permissions: ["reports.read", "policies.write"] });
  });

  it("parses positive integer policy values", async () => {
    await new UpdatePolicyUseCase(gateway).execute({ group: " fine ", valuesText: "overduePerDay=5000\ndamagedAmount=50000\nlostAmount=100000" });
    expect(gateway.updatePolicy).toHaveBeenCalledWith("fine", { overduePerDay: 5000, damagedAmount: 50000, lostAmount: 100000 });
  });

  it("normalizes audit filters and pagination", async () => {
    await new QueryAuditLogsUseCase(gateway).execute({ action: " STAFF_CREATED ", page: 0, limit: 500 });
    expect(gateway.queryAuditLogs).toHaveBeenCalledWith({ action: "STAFF_CREATED", page: 1, limit: 100 });
  });
});
