import type { BackupJob, InventoryScan, InventorySession } from "../../domain/operations";

export interface OperationsGateway {
  createInventory(branchId: string, shelfId?: string): Promise<InventorySession>;
  scanInventory(sessionId: string, barcode: string): Promise<InventoryScan>;
  completeInventory(sessionId: string): Promise<InventorySession>;
  updateCopyStatus(barcode: string, status: string, reason: string): Promise<{ id: string; barcode: string; status: string }>;
  listBackups(): Promise<BackupJob[]>;
  createBackup(): Promise<BackupJob>;
  restoreBackup(id: string): Promise<BackupJob>;
}
