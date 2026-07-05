import { CatalogNotFoundError } from "../errors/catalog-management.error";
import { CatalogQueryPort } from "../ports/catalog-query.port";

export class ListBranchesUseCase {
  constructor(private readonly query: CatalogQueryPort) {}
  execute() { return this.query.listBranches(); }
}

export class ListShelvesUseCase {
  constructor(private readonly query: CatalogQueryPort) {}
  async execute(branchId: string) {
    if (!await this.query.branchExists(branchId)) throw new CatalogNotFoundError("Branch", branchId);
    return this.query.listShelves(branchId);
  }
}

export class ListCopiesUseCase {
  constructor(private readonly query: CatalogQueryPort) {}
  async execute(bookTitleId: string) {
    if (!await this.query.titleExists(bookTitleId)) throw new CatalogNotFoundError("BookTitle", bookTitleId);
    return this.query.listCopies(bookTitleId);
  }
}
