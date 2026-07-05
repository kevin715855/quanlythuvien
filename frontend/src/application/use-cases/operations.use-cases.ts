import type { OperationsGateway } from "../ports/operations.gateway";

const required = (value: string, message: string) => { const normalized = value.trim(); if (!normalized) throw new Error(message); return normalized; };
export class CreateInventoryUseCase { constructor(private g: OperationsGateway) {} async execute(branchId: string, shelfId?: string) { return this.g.createInventory(required(branchId, "ID chi nhánh là bắt buộc"), shelfId?.trim() || undefined); } }
export class ScanInventoryUseCase { constructor(private g: OperationsGateway) {} async execute(sessionId: string, barcode: string) { return this.g.scanInventory(required(sessionId, "ID phiên kiểm kê là bắt buộc"), required(barcode, "Mã bản sao là bắt buộc").toUpperCase()); } }
export class CompleteInventoryUseCase { constructor(private g: OperationsGateway) {} async execute(sessionId: string) { return this.g.completeInventory(required(sessionId, "ID phiên kiểm kê là bắt buộc")); } }
export class UpdateCopyConditionUseCase { constructor(private g: OperationsGateway) {} async execute(barcode: string, status: string, reason: string) { return this.g.updateCopyStatus(required(barcode, "Mã bản sao là bắt buộc").toUpperCase(), status, required(reason, "Lý do là bắt buộc")); } }
export class ListBackupsUseCase { constructor(private g: OperationsGateway) {} execute() { return this.g.listBackups(); } }
export class CreateBackupUseCase { constructor(private g: OperationsGateway) {} execute() { return this.g.createBackup(); } }
export class RestoreBackupUseCase { constructor(private g: OperationsGateway) {} execute(id: string, confirmation: string) { if (confirmation !== "RESTORE") return Promise.reject(new Error("Nhập RESTORE để xác nhận")); return this.g.restoreBackup(required(id, "ID bản sao lưu là bắt buộc")); } }
