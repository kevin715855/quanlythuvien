import type { CirculationGateway } from "../../application/ports/library.gateways";
import type { BorrowBooksInput, Loan, ReturnLine, ReturnResult } from "../../domain/circulation";
import type { HttpClient } from "../http/http-client";

export class HttpCirculationGateway implements CirculationGateway {
  constructor(private readonly client: HttpClient) {}
  borrow(input: BorrowBooksInput) { return this.client.post<Loan>("/circulation/loans", input); }
  returnBooks(returns: ReturnLine[]) {
    return this.client.post<ReturnResult[]>("/circulation/returns", { returns });
  }
  listReaderLoans(readerId: string) {
    return this.client.get<Loan[]>(`/circulation/readers/${encodeURIComponent(readerId)}/loans`);
  }
  renewLoan(loanId: string, itemIds?: string[]) {
    return this.client.post<Loan>(`/circulation/loans/${encodeURIComponent(loanId)}/renew`, { ...(itemIds?.length ? { itemIds } : {}) });
  }
}
