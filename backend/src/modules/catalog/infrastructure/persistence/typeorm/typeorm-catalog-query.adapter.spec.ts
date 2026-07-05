import { DataSource } from "typeorm";
import { BookCopyOrmEntity } from "./entities/book-copy.orm-entity";
import { BookTitleOrmEntity } from "./entities/book-title.orm-entity";
import { BranchOrmEntity } from "./entities/branch.orm-entity";
import { ShelfLocationOrmEntity } from "./entities/shelf-location.orm-entity";
import { TypeOrmCatalogQueryAdapter } from "./typeorm-catalog-query.adapter";

describe("TypeOrmCatalogQueryAdapter", () => {
  it("orders branches, shelves, and copies by their business code", async () => {
    const branchRepository = { find: jest.fn().mockResolvedValue([]), exist: jest.fn().mockResolvedValue(true) };
    const shelfRepository = { find: jest.fn().mockResolvedValue([]) };
    const titleRepository = { exist: jest.fn().mockResolvedValue(true) };
    const copyRepository = { find: jest.fn().mockResolvedValue([]) };
    const dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === BranchOrmEntity) return branchRepository;
        if (entity === ShelfLocationOrmEntity) return shelfRepository;
        if (entity === BookTitleOrmEntity) return titleRepository;
        if (entity === BookCopyOrmEntity) return copyRepository;
        throw new Error("Unexpected entity");
      }),
    } as unknown as DataSource;
    const adapter = new TypeOrmCatalogQueryAdapter(dataSource);

    await adapter.listBranches();
    await adapter.listShelves("branch-1");
    await adapter.listCopies("title-1");

    expect(branchRepository.find).toHaveBeenCalledWith({ order: { code: "ASC" } });
    expect(shelfRepository.find).toHaveBeenCalledWith({ where: { branchId: "branch-1" }, order: { code: "ASC" } });
    expect(copyRepository.find).toHaveBeenCalledWith({ where: { bookTitleId: "title-1" }, order: { barcode: "ASC" } });
  });
});
