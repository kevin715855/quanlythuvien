import type { CreatePaymentCommand, PaymentMethod, PaymentResult } from "../../domain/billing";
import type { BillingGateway } from "../ports/billing.gateway";

function required(value: string, message: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(message);
  return normalized;
}

export class AssessFineUseCase {
  constructor(private readonly gateway: BillingGateway) {}
  execute(loanItemId: string) { return this.gateway.assessFine(required(loanItemId, "ID mục mượn là bắt buộc")); }
}

export class ListReaderFinesUseCase {
  constructor(private readonly gateway: BillingGateway) {}
  async execute(readerId: string) {
    return this.gateway.listFines(required(readerId, "ID độc giả là bắt buộc"));
  }
}

export class ListReaderPaymentsUseCase {
  constructor(private readonly gateway: BillingGateway) {}
  async execute(readerId: string) {
    return this.gateway.listPayments(required(readerId, "ID độc giả là bắt buộc"));
  }
}

export class CreatePaymentUseCase {
  constructor(private readonly gateway: BillingGateway) {}

  async execute(command: CreatePaymentCommand) {
    const readerId = required(command.readerId, "ID độc giả là bắt buộc");
    const fineIds = command.fineIds.map((id) => required(id, "ID khoản phạt không hợp lệ"));
    if (!fineIds.length) throw new Error("Chọn ít nhất một khoản phạt");
    if (new Set(fineIds).size !== fineIds.length) throw new Error("Các khoản phạt phải là duy nhất");
    if (!(new Set<PaymentMethod>(["CASH", "ONLINE"])).has(command.method)) throw new Error("Phương thức thanh toán không hợp lệ");
    return this.gateway.createPayment({ readerId, fineIds, method: command.method });
  }
}

export class SimulatePaymentUseCase {
  constructor(private readonly gateway: BillingGateway) {}

  async execute(paymentId: string, result: PaymentResult) {
    const id = required(paymentId, "ID giao dịch là bắt buộc");
    if (!(new Set<PaymentResult>(["SUCCEEDED", "FAILED"])).has(result)) throw new Error("Kết quả thanh toán không hợp lệ");
    return this.gateway.simulatePayment(id, result);
  }
}
