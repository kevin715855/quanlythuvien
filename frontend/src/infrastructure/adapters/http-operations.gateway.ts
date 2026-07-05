import type { OperationsGateway } from "../../application/ports/operations.gateway";
import type { BackupJob, InventoryScan, InventorySession } from "../../domain/operations";
import type { HttpClient } from "../http/http-client";

export class HttpOperationsGateway implements OperationsGateway {
  constructor(private client: HttpClient) {}
  createInventory(branchId: string, shelfId?: string) { return this.client.post<InventorySession>("/inventory/sessions", { branchId, ...(shelfId ? { shelfId } : {}) }); }
  scanInventory(id: string, barcode: string) { return this.client.post<InventoryScan>(`/inventory/sessions/${encodeURIComponent(id)}/scan`, { barcode }); }
  completeInventory(id: string) { return this.client.post<InventorySession>(`/inventory/sessions/${encodeURIComponent(id)}/complete`); }
  updateCopyStatus(barcode: string, status: string, reason: string) { return this.client.post<{ id: string; barcode: string; status: string }>("/inventory/copies/status", { barcode, status, reason }); }
  listBackups() { return this.client.get<BackupJob[]>("/admin/backups"); }
  createBackup() { return this.client.post<BackupJob>("/admin/backups"); }
  restoreBackup(id: string) { return this.client.post<BackupJob>(`/admin/backups/${encodeURIComponent(id)}/restore`, { confirmation: "RESTORE" }); }
}
