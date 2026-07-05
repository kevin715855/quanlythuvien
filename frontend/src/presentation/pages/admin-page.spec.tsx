import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createTestServices } from "../../test/fakes";
import { ServicesProvider } from "../app/services-context";
import { AdminPage } from "./admin-page";

describe("AdminPage", () => {
  it("creates a staff account", async () => {
    const services = createTestServices() as any;
    services.createStaff.execute.mockResolvedValue({ id: "staff-1", username: "librarian", role: "staff", isActive: true });
    render(<ServicesProvider services={services}><AdminPage /></ServicesProvider>);
    await userEvent.type(screen.getByLabelText("Tên đăng nhập"), "Librarian");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "secret123");
    await userEvent.selectOptions(screen.getByLabelText("Vai trò"), "staff");
    await userEvent.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    expect(services.createStaff.execute).toHaveBeenCalledWith({ username: "Librarian", password: "secret123", role: "staff" });
    expect(await screen.findByText("Đã tạo tài khoản librarian")).toBeInTheDocument();
  });

  it("updates a role and policy", async () => {
    const services = createTestServices() as any;
    services.upsertRole.execute.mockResolvedValue({ code: "manager", name: "Manager", permissions: ["reports.read"] });
    services.updatePolicy.execute.mockResolvedValue({ group: "fine", values: { overduePerDay: 5000 } });
    render(<ServicesProvider services={services}><AdminPage /></ServicesProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Vai trò & quyền" }));
    await userEvent.type(screen.getByLabelText("Mã vai trò"), "manager");
    await userEvent.type(screen.getByLabelText(/^Danh sách quyền/), "reports.read");
    await userEvent.click(screen.getByRole("button", { name: "Lưu vai trò" }));
    expect(await screen.findByText("Đã lưu vai trò manager")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Chính sách" }));
    await userEvent.selectOptions(screen.getByLabelText("Nhóm chính sách"), "fine");
    await userEvent.type(screen.getByLabelText(/^Giá trị chính sách/), "overduePerDay=5000\ndamagedAmount=50000\nlostAmount=100000");
    await userEvent.click(screen.getByRole("button", { name: "Lưu chính sách" }));
    expect(await screen.findByText("Đã cập nhật chính sách fine")).toBeInTheDocument();
  });

  it("queries audit logs", async () => {
    const services = createTestServices() as any;
    services.queryAuditLogs.execute.mockResolvedValue({ items: [{ id: "audit-1", actorId: "admin-1", action: "STAFF_CREATED", aggregateType: "Administration", aggregateId: "staff-1", reason: null, details: {}, createdAt: "2026-07-05T00:00:00.000Z" }], total: 1, page: 1, limit: 20 });
    render(<ServicesProvider services={services}><AdminPage /></ServicesProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Nhật ký" }));
    await userEvent.type(screen.getByLabelText("Hành động"), "STAFF_CREATED");
    await userEvent.click(screen.getByRole("button", { name: "Tra cứu nhật ký" }));
    expect(services.queryAuditLogs.execute).toHaveBeenCalledWith({ action: "STAFF_CREATED", page: 1, limit: 20 });
    expect(await screen.findByText("audit-1")).toBeInTheDocument();
  });
});
