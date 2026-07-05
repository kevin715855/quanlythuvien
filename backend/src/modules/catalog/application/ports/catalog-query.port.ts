import { BookCopyStatus } from "../../domain/enums/book-copy-status.enum";

export interface CatalogBranchView { id: string; code: string; name: string; address: string | null; }
export interface CatalogShelfView { id: string; branchId: string; code: string; label: string; }
export interface CatalogCopyView {
  id: string; bookTitleId: string; barcode: string; rfid: string | null;
  branchId: string; shelfLocationId: string; status: BookCopyStatus;
}

export interface CatalogQueryPort {
  listBranches(): Promise<CatalogBranchView[]>;
  branchExists(branchId: string): Promise<boolean>;
  listShelves(branchId: string): Promise<CatalogShelfView[]>;
  titleExists(bookTitleId: string): Promise<boolean>;
  listCopies(bookTitleId: string): Promise<CatalogCopyView[]>;
}
