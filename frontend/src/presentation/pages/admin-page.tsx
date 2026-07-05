import { type FormEvent, useState } from "react";
import type { AuditLog } from "../../domain/administration";
import { useServices } from "../app/services-context";
import { DataTable } from "../components/data-table";
import { FormField } from "../components/form-field";
import { Toast } from "../components/toast";

export function AdminPage() {
  const services = useServices();
  const [tab, setTab] = useState<"staff" | "roles" | "policy" | "audit">("staff");
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [staffRole, setStaffRole] = useState("staff");
  const [roleCode, setRoleCode] = useState(""); const [roleName, setRoleName] = useState(""); const [permissions, setPermissions] = useState("");
  const [policyGroup, setPolicyGroup] = useState("loan"); const [policyValues, setPolicyValues] = useState("");
  const [action, setAction] = useState(""); const [audits, setAudits] = useState<AuditLog[]>([]);
  const [accountId,setAccountId]=useState("");const[accountActive,setAccountActive]=useState(true);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const execute = async <T,>(work: () => Promise<T>) => { setBusy(true); setError(""); setMessage(""); try { return await work(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Thao tác thất bại"); return null; } finally { setBusy(false); } };

  async function createStaff(event: FormEvent) { event.preventDefault(); const result = await execute(() => services.createStaff.execute({ username, password, role: staffRole })); if (result) { setMessage(`Đã tạo tài khoản ${result.username}`); setUsername(""); setPassword(""); } }
  async function changeStatus(event:FormEvent){event.preventDefault();const result=await execute(()=>services.setStaffStatus.execute(accountId,accountActive));if(result)setMessage(`Đã ${result.isActive?"mở":"khóa"} tài khoản ${result.id}`);}
  async function saveRole(event: FormEvent) { event.preventDefault(); const result = await execute(() => services.upsertRole.execute({ code: roleCode, name: roleName, permissionsText: permissions })); if (result) setMessage(`Đã lưu vai trò ${result.code}`); }
  async function savePolicy(event: FormEvent) { event.preventDefault(); const result = await execute(() => services.updatePolicy.execute({ group: policyGroup, valuesText: policyValues })); if (result) setMessage(`Đã cập nhật chính sách ${result.group}`); }
  async function queryAudits(event: FormEvent) { event.preventDefault(); const result = await execute(() => services.queryAuditLogs.execute({ action, page: 1, limit: 20 })); if (result) setAudits(result.items); }

  return <section><div className="page-heading"><div><p className="eyebrow">Administration</p><h1>Quản trị hệ thống</h1></div></div>
    {error && <Toast message={error} tone="error" />}{message && <Toast message={message} />}
    <div className="tabs"><button className={tab === "staff" ? "active" : ""} onClick={() => setTab("staff")}>Nhân viên</button><button className={tab === "roles" ? "active" : ""} onClick={() => setTab("roles")}>Vai trò &amp; quyền</button><button className={tab === "policy" ? "active" : ""} onClick={() => setTab("policy")}>Chính sách</button><button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>Nhật ký</button></div>
    {tab === "staff" && <div className="two-column"><form className="panel form-grid" onSubmit={createStaff}><h2>Tạo tài khoản</h2><FormField label="Tên đăng nhập"><input value={username} onChange={(e) => setUsername(e.target.value)} /></FormField><FormField label="Mật khẩu"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></FormField><FormField label="Vai trò"><select value={staffRole} onChange={(e) => setStaffRole(e.target.value)}><option value="staff">Nhân viên</option><option value="admin">Quản trị viên</option></select></FormField><div className="form-actions"><button disabled={busy}>Tạo tài khoản</button></div></form><form className="panel" onSubmit={changeStatus}><h2>Khóa / mở tài khoản</h2><FormField label="ID tài khoản"><input value={accountId} onChange={e=>setAccountId(e.target.value)}/></FormField><FormField label="Trạng thái"><select value={String(accountActive)} onChange={e=>setAccountActive(e.target.value==="true")}><option value="true">Hoạt động</option><option value="false">Khóa</option></select></FormField><button disabled={busy}>Cập nhật tài khoản</button></form></div>}
    {tab === "roles" && <form className="panel form-grid" onSubmit={saveRole}><FormField label="Mã vai trò"><input value={roleCode} onChange={(e) => setRoleCode(e.target.value)} /></FormField><FormField label="Tên vai trò"><input value={roleName} onChange={(e) => setRoleName(e.target.value)} /></FormField><FormField label="Danh sách quyền" hint="Phân cách bằng dấu phẩy hoặc xuống dòng"><textarea value={permissions} onChange={(e) => setPermissions(e.target.value)} /></FormField><div className="form-actions"><button disabled={busy}>Lưu vai trò</button></div></form>}
    {tab === "policy" && <form className="panel form-grid" onSubmit={savePolicy}><FormField label="Nhóm chính sách"><select value={policyGroup} onChange={(e) => setPolicyGroup(e.target.value)}><option value="loan">Mượn sách</option><option value="reservation">Đặt chỗ</option><option value="fine">Phí phạt</option></select></FormField><FormField label="Giá trị chính sách" hint="Mỗi dòng: key=số nguyên"><textarea value={policyValues} onChange={(e) => setPolicyValues(e.target.value)} /></FormField><div className="form-actions"><button disabled={busy}>Lưu chính sách</button></div></form>}
    {tab === "audit" && <><form className="panel inline-form" onSubmit={queryAudits}><FormField label="Hành động"><input value={action} onChange={(e) => setAction(e.target.value)} /></FormField><button disabled={busy}>Tra cứu nhật ký</button></form>{audits.length ? <DataTable rows={audits} rowKey={(row) => row.id} columns={[{ key: "id", header: "Mã", render: (row) => row.id }, { key: "action", header: "Hành động", render: (row) => row.action }, { key: "actor", header: "Người thực hiện", render: (row) => row.actorId ?? "Hệ thống" }, { key: "created", header: "Thời gian", render: (row) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(row.createdAt)) }]} /> : <p className="empty-state">Chưa có dữ liệu nhật ký.</p>}</>}
  </section>;
}
