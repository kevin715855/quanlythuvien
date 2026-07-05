import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { createTestServices } from "../../test/fakes";
import { AuthProvider } from "../app/auth-context";
import { ServicesProvider } from "../app/services-context";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("shows business navigation and signs the current user out", async () => {
    const services = createTestServices();
    vi.mocked(services.restoreSession.execute).mockResolvedValue({
      id: "user-1", readerId: null, username: "staff", role: "staff" as never,
    });
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ServicesProvider services={services}>
          <AuthProvider><AppShell /></AuthProvider>
        </ServicesProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("navigation", { name: "Nghiệp vụ thư viện" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tổng quan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Độc giả" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mượn / trả" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đặt chỗ" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Phí phạt" })).toHaveAttribute("href", "/billing");
    expect(screen.queryByRole("link", { name: "Quản trị" })).not.toBeInTheDocument();
    expect(screen.getByText("staff · staff")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
    expect(services.logout.execute).toHaveBeenCalledOnce();
  });

  it("shows only administration navigation to an admin", async () => {
    const services = createTestServices();
    vi.mocked(services.restoreSession.execute).mockResolvedValue({
      id: "admin-1", readerId: null, username: "admin", role: "admin" as never,
    });
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ServicesProvider services={services}>
          <AuthProvider><AppShell /></AuthProvider>
        </ServicesProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("link", { name: "Quản trị" })).toHaveAttribute("href", "/admin");
    expect(screen.queryByRole("link", { name: "Mượn / trả" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Phí phạt" })).not.toBeInTheDocument();
  });
});
