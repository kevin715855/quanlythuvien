import { type FormEvent, useState } from "react";
import type { Fine, PaymentMethod, PaymentResult, PaymentTransaction } from "../../domain/billing";
import { useServices } from "../app/services-context";
import { DataTable } from "../components/data-table";
import { FormField } from "../components/form-field";
import { StatusBadge } from "../components/status-badge";
import { Toast } from "../components/toast";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const date = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const fineReasons: Record<Fine["reason"], string> = { OVERDUE: "Quá hạn", DAMAGED: "Hư hỏng", LOST: "Thất lạc" };

export function BillingPage() {
  const services = useServices();
  const [tab, setTab] = useState<"fines" | "payments">("fines");
  const [readerId, setReaderId] = useState("");
  const [loadedReaderId, setLoadedReaderId] = useState("");
  const [fines, setFines] = useState<Fine[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [selectedFineIds, setSelectedFineIds] = useState<string[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [pendingPayment, setPendingPayment] = useState<PaymentTransaction | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const execute = async <T,>(work: () => Promise<T>): Promise<T | null> => {
    setBusy(true); setError(""); setMessage("");
    try { return await work(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Thao tác thất bại"); return null; }
    finally { setBusy(false); }
  };

  async function load(id: string) {
    const [nextFines, nextPayments] = await Promise.all([
      services.listReaderFines.execute(id), services.listReaderPayments.execute(id),
    ]);
    setFines(nextFines); setPayments(nextPayments);
  }

  async function lookup(event: FormEvent) {
    event.preventDefault();
    const id = readerId.trim();
    const result = await execute(async () => { await load(id); return id; });
    if (result) { setLoadedReaderId(result); setSelectedFineIds([]); setPendingPayment(null); }
  }

  function toggleFine(fineId: string) {
    setSelectedFineIds((current) => current.includes(fineId)
      ? current.filter((id) => id !== fineId)
      : [...current, fineId]);
  }

  async function createPayment(event: FormEvent) {
    event.preventDefault();
    const payment = await execute(() => services.createPayment.execute({ readerId: loadedReaderId, fineIds: selectedFineIds, method }));
    if (!payment) return;
    setSelectedFineIds([]);
    setPendingPayment(payment.status === "PENDING" ? payment : null);
    setMessage(payment.method === "CASH" ? "Thanh toán tiền mặt thành công" : "Giao dịch online đang chờ xử lý");
    await load(loadedReaderId);
  }

  async function simulate(result: PaymentResult) {
    if (!pendingPayment) return;
    const payment = await execute(() => services.simulatePayment.execute(pendingPayment.id, result));
    if (!payment) return;
    setPendingPayment(null);
    setMessage(result === "SUCCEEDED"
      ? "Thanh toán online thành công"
      : "Thanh toán online thất bại; các khoản phạt đã được mở lại");
    await load(loadedReaderId);
  }

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow">Billing</p><h1>Phí phạt và thanh toán</h1></div></div>
      {error && <Toast message={error} tone="error" />}{message && <Toast message={message} />}
      <form className="panel inline-form" onSubmit={lookup}>
        <FormField label="ID độc giả"><input value={readerId} onChange={(event) => setReaderId(event.target.value)} /></FormField>
        <button disabled={busy}>Tra cứu phí phạt</button>
      </form>

      {loadedReaderId && <>
        <div className="tabs">
          <button className={tab === "fines" ? "active" : ""} onClick={() => setTab("fines")}>Khoản phạt</button>
          <button className={tab === "payments" ? "active" : ""} onClick={() => setTab("payments")}>Lịch sử thanh toán</button>
        </div>

        {tab === "fines" && <>
          {fines.length > 0 ? <DataTable rows={fines} rowKey={(fine) => fine.id} columns={[
            { key: "select", header: "Chọn", render: (fine) => <input type="checkbox" aria-label={`Chọn khoản phạt ${fine.id}`} checked={selectedFineIds.includes(fine.id)} disabled={busy || fine.status !== "UNPAID" || fine.pendingPaymentId !== null} onChange={() => toggleFine(fine.id)} /> },
            { key: "id", header: "Mã khoản phạt", render: (fine) => fine.id },
            { key: "reason", header: "Lý do", render: (fine) => fineReasons[fine.reason] },
            { key: "amount", header: "Số tiền", render: (fine) => money.format(fine.amount) },
            { key: "created", header: "Ngày tạo", render: (fine) => date.format(new Date(fine.createdAt)) },
            { key: "status", header: "Trạng thái", render: (fine) => <StatusBadge value={fine.pendingPaymentId ? "PENDING_PAYMENT" : fine.status} /> },
          ]} /> : <p className="empty-state">Độc giả không có khoản phạt.</p>}

          <form className="panel payment-actions" onSubmit={createPayment}>
            <FormField label="Phương thức thanh toán"><select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}><option value="CASH">Tiền mặt</option><option value="ONLINE">Online (giả lập)</option></select></FormField>
            <p>Đã chọn: <strong>{selectedFineIds.length}</strong> khoản</p>
            <button disabled={busy || selectedFineIds.length === 0}>Tạo thanh toán</button>
          </form>

          {pendingPayment && <article className="detail-card pending-payment">
            <div><p className="eyebrow">Giao dịch đang chờ</p><h2>{pendingPayment.id}</h2><p>{money.format(pendingPayment.totalAmount)}</p></div>
            <div className="button-row"><button disabled={busy} onClick={() => void simulate("SUCCEEDED")}>Mô phỏng thành công</button><button disabled={busy} className="button-secondary" onClick={() => void simulate("FAILED")}>Mô phỏng thất bại</button></div>
          </article>}
        </>}

        {tab === "payments" && (payments.length > 0 ? <DataTable rows={payments} rowKey={(payment) => payment.id} columns={[
          { key: "id", header: "Mã giao dịch", render: (payment) => payment.id },
          { key: "amount", header: "Tổng tiền", render: (payment) => money.format(payment.totalAmount) },
          { key: "method", header: "Phương thức", render: (payment) => payment.method },
          { key: "status", header: "Trạng thái", render: (payment) => <StatusBadge value={payment.status} /> },
          { key: "created", header: "Ngày tạo", render: (payment) => date.format(new Date(payment.createdAt)) },
          { key: "completed", header: "Hoàn tất", render: (payment) => payment.completedAt ? date.format(new Date(payment.completedAt)) : "—" },
        ]} /> : <p className="empty-state">Chưa có giao dịch thanh toán.</p>)}
      </>}
    </section>
  );
}
