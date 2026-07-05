import { describe, expect, it, vi } from "vitest";
import type { HttpClient } from "../http/http-client";
import { HttpAdministrationGateway } from "./http-administration.gateway";

describe("HttpAdministrationGateway", () => {
  it("maps all administration routes", async () => {
    const client = { post: vi.fn(), put: vi.fn(), get: vi.fn() } as unknown as HttpClient;
    const gateway = new HttpAdministrationGateway(client);
    await gateway.createStaff({ username: "staff", password: "secret123", role: "staff" });
    await gateway.upsertRole("catalog manager", { name: "Catalog", permissions: ["catalog.write"] });
    await gateway.updatePolicy("fine rules", { overduePerDay: 5000 });
    await gateway.queryAuditLogs({ action: "STAFF_CREATED", page: 2, limit: 10 });
    expect(client.post).toHaveBeenCalledWith("/admin/staff", { username: "staff", password: "secret123", role: "staff" });
    expect(client.put).toHaveBeenNthCalledWith(1, "/admin/roles/catalog%20manager", { name: "Catalog", permissions: ["catalog.write"] });
    expect(client.put).toHaveBeenNthCalledWith(2, "/admin/policies/fine%20rules", { values: { overduePerDay: 5000 } });
    expect(client.get).toHaveBeenCalledWith("/admin/audit-logs?action=STAFF_CREATED&page=2&limit=10");
  });
});
