import { CatalogNotFoundError } from "../errors/catalog-management.error";
import { CatalogQueryPort } from "../ports/catalog-query.port";
import { ListBranchesUseCase, ListCopiesUseCase, ListShelvesUseCase } from "./catalog-query.use-cases";

describe("Catalog query use cases", () => {
  let query: jest.Mocked<CatalogQueryPort>;

  beforeEach(() => {
    query = {
      listBranches: jest.fn(),
      branchExists: jest.fn(),
      listShelves: jest.fn(),
      titleExists: jest.fn(),
      listCopies: jest.fn(),
    };
  });

  it("returns branch views from the query port", async () => {
    const branches = [{ id: "branch-1", code: "MAIN", name: "Main", address: null }];
    query.listBranches.mockResolvedValue(branches);
    await expect(new ListBranchesUseCase(query).execute()).resolves.toEqual(branches);
  });

  it("rejects shelf listing when its branch does not exist", async () => {
    query.branchExists.mockResolvedValue(false);
    await expect(new ListShelvesUseCase(query).execute("branch-1"))
      .rejects.toBeInstanceOf(CatalogNotFoundError);
    expect(query.listShelves).not.toHaveBeenCalled();
  });

  it("rejects copy listing when its title does not exist", async () => {
    query.titleExists.mockResolvedValue(false);
    await expect(new ListCopiesUseCase(query).execute("title-1"))
      .rejects.toMatchObject({ message: "BookTitle title-1 was not found" });
    expect(query.listCopies).not.toHaveBeenCalled();
  });
});
