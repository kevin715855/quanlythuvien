import { describe, expect, it, vi } from "vitest";
import type { OperationsGateway } from "../ports/operations.gateway";
import { RestoreBackupUseCase, ScanInventoryUseCase, UpdateCopyConditionUseCase } from "./operations.use-cases";

const gateway = (): OperationsGateway => ({ createInventory:vi.fn(),scanInventory:vi.fn(),completeInventory:vi.fn(),updateCopyStatus:vi.fn(),listBackups:vi.fn(),createBackup:vi.fn(),restoreBackup:vi.fn() });
describe("Operations use cases",()=>{
  it("normalizes an inventory barcode",async()=>{const g=gateway();await new ScanInventoryUseCase(g).execute("session-1"," copy-01 ");expect(g.scanInventory).toHaveBeenCalledWith("session-1","COPY-01");});
  it("requires a copy status reason",async()=>{const g=gateway();await expect(new UpdateCopyConditionUseCase(g).execute("copy","LOST"," ")).rejects.toThrow("Lý do là bắt buộc");});
  it("requires explicit restore confirmation",async()=>{const g=gateway();await expect(new RestoreBackupUseCase(g).execute("backup-1","no")).rejects.toThrow("Nhập RESTORE");expect(g.restoreBackup).not.toHaveBeenCalled();});
});
