import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserSessionStore } from "../auth/browser-session-store";
import { HttpClient } from "../http/http-client";
import { HttpAuthGateway } from "./http-auth.gateway";
import { HttpCirculationGateway } from "./http-circulation.gateway";
import { HttpReadersGateway } from "./http-readers.gateway";
import { HttpReportingGateway } from "./http-reporting.gateway";
import { HttpReservationsGateway } from "./http-reservations.gateway";

const jsonResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({ success: true, data }),
}) as unknown as Response;

describe("HTTP adapters", () => {
  let fetcher: ReturnType<typeof vi.fn>;
  let client: HttpClient;

  beforeEach(() => {
    fetcher = vi.fn().mockResolvedValue(jsonResponse({}));
    client = new HttpClient("/api", new BrowserSessionStore(localStorage), fetcher);
  });

  it("uses public auth routes", async () => {
    const gateway = new HttpAuthGateway(client);
    await gateway.login({ username: "staff", password: "password1" });
    expect(fetcher).toHaveBeenCalledWith("/api/auth/login", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ username: "staff", password: "password1" }),
    }));
  });

  it("encodes the report query", async () => {
    await new HttpReportingGateway(client).getOperationalReport({
      from: "2026-07-01", to: "2026-07-31", branchId: "branch/a",
    });
    expect(fetcher.mock.calls[0][0]).toBe(
      "/api/reports/operations?from=2026-07-01&to=2026-07-31&branchId=branch%2Fa",
    );
  });

  it("maps reader commands to their routes", async () => {
    const gateway = new HttpReadersGateway(client);
    await gateway.get("reader/id");
    await gateway.changeCardStatus("reader/id", "LOCK", "lost");
    expect(fetcher.mock.calls[0][0]).toBe("/api/readers/reader%2Fid");
    expect(fetcher.mock.calls[1][0]).toBe("/api/readers/reader%2Fid/lock");
  });

  it("maps circulation payloads", async () => {
    const gateway = new HttpCirculationGateway(client);
    await gateway.borrow({ cardNumber: "CARD001", barcodes: ["COPY01"] });
    await gateway.returnBooks([{ barcode: "COPY01", condition: "NORMAL" }]);
    expect(fetcher.mock.calls[0][0]).toBe("/api/circulation/loans");
    expect(fetcher.mock.calls[1][0]).toBe("/api/circulation/returns");
  });

  it("maps reservation cancellation and allocation", async () => {
    const gateway = new HttpReservationsGateway(client);
    await gateway.cancel("reservation/id", "requested");
    await gateway.allocate({ bookTitleId: "title", branchId: "branch" });
    expect(fetcher.mock.calls[0][0]).toBe("/api/reservations/reservation%2Fid/cancel");
    expect(fetcher.mock.calls[1][0]).toBe("/api/reservations/allocate");
  });
});
