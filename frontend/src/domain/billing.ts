export type FineReason = "OVERDUE" | "DAMAGED" | "LOST";
export type FineStatus = "UNPAID" | "PAID" | "WAIVED";
export type PaymentMethod = "CASH" | "ONLINE";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED";
export type PaymentResult = Exclude<PaymentStatus, "PENDING">;

export interface Fine {
  id: string;
  readerId: string;
  loanId: string;
  loanItemId: string;
  reason: FineReason;
  amount: number;
  status: FineStatus;
  pendingPaymentId: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface PaymentTransaction {
  id: string;
  readerId: string;
  fineIds: string[];
  totalAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  providerReference: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CreatePaymentCommand {
  readerId: string;
  fineIds: string[];
  method: PaymentMethod;
}
