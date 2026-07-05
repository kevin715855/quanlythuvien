export interface InventorySession { id: string; branchId: string; shelfId: string | null; status: "OPEN" | "COMPLETED"; startedAt: string; completedAt: string | null; missingCount?: number }
export interface InventoryScan { copyId: string; barcode: string; type: "EXPECTED" | "UNEXPECTED" }
export interface BackupJob { id: string; operation: "BACKUP" | "RESTORE"; status: string; location?: string | null; createdAt: string; completedAt: string | null }
