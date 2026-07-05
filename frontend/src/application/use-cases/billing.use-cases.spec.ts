import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BillingGateway } from "../ports/billing.gateway";
import { CreatePaymentUseCase, ListReaderFinesUseCase, ListReaderPaymentsUseCase, SimulatePaymentUseCase } from "./billing.use-cases";

describe("Billing use cases", () => {
  let gateway: BillingGateway;

  beforeEach(() => {
    gateway = {
      assessFine: vi.fn(),
      listFines: vi.fn().mockResolvedValue([]),
      listPayments: vi.fn().mockResolvedValue([]),
      createPayment: vi.fn(),
      simulatePayment: vi.fn(),
    };
  });

  it("trims the reader ID before listing fines and payments", async () => {
    await new ListReaderFinesUseCase(gateway).execute(" reader-1 ");
    await new ListReaderPaymentsUseCase(gateway).execute(" reader-1 ");

    expect(gateway.listFines).toHaveBeenCalledWith("reader-1");
    expect(gateway.listPayments).toHaveBeenCalledWith("reader-1");
  });

  it("rejects an empty reader ID", async () => {
    await expect(new ListReaderFinesUseCase(gateway).execute("  ")).rejects.toThrow("ID độc giả là bắt buộc");
    expect(gateway.listFines).not.toHaveBeenCalled();
  });

  it("normalizes a valid payment command", async () => {
    await new CreatePaymentUseCase(gateway).execute({
      readerId: " reader-1 ", fineIds: [" fine-1 ", "fine-2"], method: "CASH",
    });

    expect(gateway.createPayment).toHaveBeenCalledWith({
      readerId: "reader-1", fineIds: ["fine-1", "fine-2"], method: "CASH",
    });
  });

  it("rejects empty and duplicate fine IDs", async () => {
    const useCase = new CreatePaymentUseCase(gateway);
    await expect(useCase.execute({ readerId: "reader-1", fineIds: [], method: "CASH" }))
      .rejects.toThrow("Chọn ít nhất một khoản phạt");
    await expect(useCase.execute({ readerId: "reader-1", fineIds: ["fine-1", " fine-1 "], method: "ONLINE" }))
      .rejects.toThrow("Các khoản phạt phải là duy nhất");
    expect(gateway.createPayment).not.toHaveBeenCalled();
  });

  it("forwards supported simulation results and rejects unsupported values", async () => {
    const useCase = new SimulatePaymentUseCase(gateway);
    await useCase.execute(" payment-1 ", "SUCCEEDED");
    expect(gateway.simulatePayment).toHaveBeenCalledWith("payment-1", "SUCCEEDED");

    await expect(useCase.execute("payment-1", "PENDING" as "SUCCEEDED"))
      .rejects.toThrow("Kết quả thanh toán không hợp lệ");
  });
});
