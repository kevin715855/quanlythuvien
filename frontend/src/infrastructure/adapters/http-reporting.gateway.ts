import type { ReportingGateway } from "../../application/ports/library.gateways";
import type { OperationalReport, ReportFilter } from "../../domain/report";
import type { HttpClient } from "../http/http-client";

export class HttpReportingGateway implements ReportingGateway {
  constructor(private readonly client: HttpClient) {}
  getOperationalReport(filter: ReportFilter) {
    const query = new URLSearchParams({ from: filter.from, to: filter.to });
    if (filter.branchId) query.set("branchId", filter.branchId);
    return this.client.get<OperationalReport>(`/reports/operations?${query.toString()}`);
  }
}
