import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Fine, PaymentTransaction } from "../../domain/billing";
import { createTestServices } from "../../test/fakes";
import { ServicesProvider } from "../app/services-context";
import { BillingPage } from "./billing-page";

const readerId = "550e8400-e29b-41d4-a716-446655440000";
const fines: Fine[] = [
  { id: "fine-1", readerId, loanId: "loan-1", loanItemId: "item-1", reason: "OVERDUE", amount: 15000, status: "UNPAID", pendingPaymentId: null, createdAt: "2026-07-01T00:00:00.000Z", paidAt: null },
  { id: "fine-2", readerId, loanId: "loan-1", loanItemId: "item-2", reason: "DAMAGED", amount: 50000, status: "UNPAID", pendingPaymentId: null, createdAt: "2026-07-02T00:00:00.000Z", paidAt: null },
];

const onlinePayment: PaymentTransaction = {
  id: "payment-1", readerId, fineIds: ["fine-1"], totalAmount: 15000,
  method: "ONLINE", status: "PENDING", providerReference: "SIM-payment-1",
  createdAt: "2026-07-05T00:00:00.000Z", completedAt: null,
};

function renderPage() {
  const services = createTestServices();
  vi.mocked(services.listReaderFines.execute).mockResolvedValue(fines);
  vi.mocked(services.listReaderPayments.execute).mockResolvedValue([]);
  render(<ServicesProvider services={services}><BillingPage /></ServicesProvider>);
  return services;
}

async function lookup() {
  await userEvent.type(screen.getByLabelText("ID độc giả"), readerId);
  await userEvent.click(screen.getByRole("button", { name: "Tra cứu phí phạt" }));
  await screen.findByText("fine-1");
}

describe("BillingPage", () => {
  it("loads fines and completes a multi-fine cash payment", async () => {
    const services = renderPage();
    vi.mocked(services.createPayment.execute).mockResolvedValue({ ...onlinePayment, method: "CASH", status: "SUCCEEDED", providerReference: null, fineIds: ["fine-1", "fine-2"], totalAmount: 65000, completedAt: onlinePayment.createdAt });

    await lookup();
    await userEvent.click(screen.getByRole("checkbox", { name: "Chọn khoản phạt fine-1" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Chọn khoản phạt fine-2" }));
    await userEvent.selectOptions(screen.getByLabelText("Phương thức thanh toán"), "CASH");
    await userEvent.click(screen.getByRole("button", { name: "Tạo thanh toán" }));

    expect(services.createPayment.execute).toHaveBeenCalledWith({ readerId, fineIds: ["fine-1", "fine-2"], method: "CASH" });
    expect(await screen.findByText("Thanh toán tiền mặt thành công")).toBeInTheDocument();
    expect(services.listReaderFines.execute).toHaveBeenCalledTimes(2);
    expect(services.listReaderPayments.execute).toHaveBeenCalledTimes(2);
  });

  it("creates an online payment and simulates success", async () => {
    const services = renderPage();
    vi.mocked(services.createPayment.execute).mockResolvedValue(onlinePayment);
    vi.mocked(services.simulatePayment.execute).mockResolvedValue({ ...onlinePayment, status: "SUCCEEDED", completedAt: "2026-07-05T00:01:00.000Z" });

    await lookup();
    await userEvent.click(screen.getByRole("checkbox", { name: "Chọn khoản phạt fine-1" }));
    await userEvent.selectOptions(screen.getByLabelText("Phương thức thanh toán"), "ONLINE");
    await userEvent.click(screen.getByRole("button", { name: "Tạo thanh toán" }));
    expect(await screen.findByText("Giao dịch online đang chờ xử lý")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Mô phỏng thành công" }));

    expect(services.simulatePayment.execute).toHaveBeenCalledWith("payment-1", "SUCCEEDED");
    expect(await screen.findByText("Thanh toán online thành công")).toBeInTheDocument();
  });

  it("shows payment history and can simulate failure", async () => {
    const services = createTestServices();
    vi.mocked(services.listReaderFines.execute).mockResolvedValue(fines);
    vi.mocked(services.listReaderPayments.execute).mockResolvedValue([onlinePayment]);
    vi.mocked(services.createPayment.execute).mockResolvedValue(onlinePayment);
    vi.mocked(services.simulatePayment.execute).mockResolvedValue({ ...onlinePayment, status: "FAILED", completedAt: "2026-07-05T00:01:00.000Z" });
    render(<ServicesProvider services={services}><BillingPage /></ServicesProvider>);

    await lookup();
    await userEvent.click(screen.getByRole("button", { name: "Lịch sử thanh toán" }));
    expect(await screen.findByText("payment-1")).toBeInTheDocument();
    expect(screen.getByText("ONLINE")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Khoản phạt" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Chọn khoản phạt fine-1" }));
    await userEvent.selectOptions(screen.getByLabelText("Phương thức thanh toán"), "ONLINE");
    await userEvent.click(screen.getByRole("button", { name: "Tạo thanh toán" }));
    await userEvent.click(screen.getByRole("button", { name: "Mô phỏng thất bại" }));

    expect(services.simulatePayment.execute).toHaveBeenCalledWith("payment-1", "FAILED");
    expect(await screen.findByText("Thanh toán online thất bại; các khoản phạt đã được mở lại")).toBeInTheDocument();
  });
});
