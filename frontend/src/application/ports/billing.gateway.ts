import type { CreatePaymentCommand, Fine, PaymentResult, PaymentTransaction } from "../../domain/billing";

export interface BillingGateway {
  listFines(readerId: string): Promise<Fine[]>;
  listPayments(readerId: string): Promise<PaymentTransaction[]>;
  createPayment(command: CreatePaymentCommand): Promise<PaymentTransaction>;
  simulatePayment(paymentId: string, result: PaymentResult): Promise<PaymentTransaction>;
}
