import type { SessionStore } from "./ports/auth.gateway";
import type { CreateStaffUseCase, QueryAuditLogsUseCase, SetStaffStatusUseCase, UpdatePolicyUseCase, UpsertRoleUseCase } from "./use-cases/administration.use-cases";
import type { LoginUseCase, LogoutUseCase, RestoreSessionUseCase } from "./use-cases/auth.use-cases";
import type { AssessFineUseCase, CreatePaymentUseCase, ListReaderFinesUseCase, ListReaderPaymentsUseCase, SimulatePaymentUseCase } from "./use-cases/billing.use-cases";
import type { CreateCatalogBranchUseCase, CreateCatalogShelfUseCase, CreateCatalogTitleUseCase, CreateCopyUseCase, ListCatalogBranchesUseCase, ListCatalogCopiesUseCase, ListCatalogShelvesUseCase, SearchCatalogUseCase, UpdateCatalogTitleUseCase, UpdateCopyUseCase } from "./use-cases/catalog.use-cases";
import type {
  AllocateReservationUseCase,
  BorrowBooksUseCase,
  CancelReservationUseCase,
  ChangeCardStatusUseCase,
  GetOperationalReportUseCase,
  GetReaderUseCase,
  ListReaderLoansUseCase,
  ListReservationsUseCase,
  RegisterReaderUseCase,
  RenewReaderCardUseCase,
  RenewLoanUseCase,
  PlaceReservationUseCase,
  ReturnBooksUseCase,
  UpdateReaderUseCase,
} from "./use-cases/library.use-cases";
import type { CompleteInventoryUseCase, CreateBackupUseCase, CreateInventoryUseCase, ListBackupsUseCase, RestoreBackupUseCase, ScanInventoryUseCase, UpdateCopyConditionUseCase } from "./use-cases/operations.use-cases";

export interface AppServices {
  sessions: SessionStore;
  login: Pick<LoginUseCase, "execute">;
  restoreSession: Pick<RestoreSessionUseCase, "execute">;
  logout: Pick<LogoutUseCase, "execute">;
  getOperationalReport: Pick<GetOperationalReportUseCase, "execute">;
  registerReader: Pick<RegisterReaderUseCase, "execute">;
  getReader: Pick<GetReaderUseCase, "execute">;
  updateReader: Pick<UpdateReaderUseCase, "execute">;
  renewReaderCard: Pick<RenewReaderCardUseCase, "execute">;
  changeCardStatus: Pick<ChangeCardStatusUseCase, "execute">;
  borrowBooks: Pick<BorrowBooksUseCase, "execute">;
  returnBooks: Pick<ReturnBooksUseCase, "execute">;
  listReaderLoans: Pick<ListReaderLoansUseCase, "execute">;
  listReservations: Pick<ListReservationsUseCase, "execute">;
  cancelReservation: Pick<CancelReservationUseCase, "execute">;
  allocateReservation: Pick<AllocateReservationUseCase, "execute">;
  searchCatalog: Pick<SearchCatalogUseCase, "execute">;
  listCatalogBranches: Pick<ListCatalogBranchesUseCase, "execute">;
  listCatalogShelves: Pick<ListCatalogShelvesUseCase, "execute">;
  listCatalogCopies: Pick<ListCatalogCopiesUseCase, "execute">;
  createCatalogTitle: Pick<CreateCatalogTitleUseCase, "execute">;
  updateCatalogTitle: Pick<UpdateCatalogTitleUseCase, "execute">;
  createCatalogBranch: Pick<CreateCatalogBranchUseCase, "execute">;
  createCatalogShelf: Pick<CreateCatalogShelfUseCase, "execute">;
  createCatalogCopy: Pick<CreateCopyUseCase, "execute">;
  updateCatalogCopy: Pick<UpdateCopyUseCase, "execute">;
  listReaderFines: Pick<ListReaderFinesUseCase, "execute">;
  listReaderPayments: Pick<ListReaderPaymentsUseCase, "execute">;
  createPayment: Pick<CreatePaymentUseCase, "execute">;
  simulatePayment: Pick<SimulatePaymentUseCase, "execute">;
  assessFine: Pick<AssessFineUseCase, "execute">;
  renewLoan: Pick<RenewLoanUseCase, "execute">;
  placeReservation: Pick<PlaceReservationUseCase, "execute">;
  createStaff: Pick<CreateStaffUseCase, "execute">;
  upsertRole: Pick<UpsertRoleUseCase, "execute">;
  updatePolicy: Pick<UpdatePolicyUseCase, "execute">;
  queryAuditLogs: Pick<QueryAuditLogsUseCase, "execute">;
  setStaffStatus: Pick<SetStaffStatusUseCase, "execute">;
  createInventory: Pick<CreateInventoryUseCase, "execute">;
  scanInventory: Pick<ScanInventoryUseCase, "execute">;
  completeInventory: Pick<CompleteInventoryUseCase, "execute">;
  updateCopyCondition: Pick<UpdateCopyConditionUseCase, "execute">;
  listBackups: Pick<ListBackupsUseCase, "execute">;
  createBackup: Pick<CreateBackupUseCase, "execute">;
  restoreBackup: Pick<RestoreBackupUseCase, "execute">;
}
