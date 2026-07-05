import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { createTestServices } from "../../test/fakes";
import { AuthProvider } from "./auth-context";
import { RoleRoute } from "./role-route";
import { ServicesProvider } from "./services-context";

describe("RoleRoute", () => {
  it("redirects staff away from an admin-only route", async () => {
    const services = createTestServices();
    vi.mocked(services.restoreSession.execute).mockResolvedValue({ id: "staff-1", readerId: null, username: "staff", role: "staff" });
    render(<MemoryRouter initialEntries={["/admin"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ServicesProvider services={services}><AuthProvider><Routes><Route element={<RoleRoute roles={["admin"]} />}><Route path="/admin" element={<div>admin page</div>} /></Route><Route path="/dashboard" element={<div>staff dashboard</div>} /></Routes></AuthProvider></ServicesProvider></MemoryRouter>);
    expect(await screen.findByText("staff dashboard")).toBeInTheDocument();
    expect(screen.queryByText("admin page")).not.toBeInTheDocument();
  });
});
