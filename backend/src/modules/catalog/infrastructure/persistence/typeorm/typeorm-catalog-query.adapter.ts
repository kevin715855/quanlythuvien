import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CatalogQueryPort } from "../../../application/ports/catalog-query.port";
import { BookCopyOrmEntity } from "./entities/book-copy.orm-entity";
import { BookTitleOrmEntity } from "./entities/book-title.orm-entity";
import { BranchOrmEntity } from "./entities/branch.orm-entity";
import { ShelfLocationOrmEntity } from "./entities/shelf-location.orm-entity";

@Injectable()
export class TypeOrmCatalogQueryAdapter implements CatalogQueryPort {
  constructor(private readonly dataSource: DataSource) {}

  async listBranches() {
    const rows = await this.dataSource.getRepository(BranchOrmEntity).find({ order: { code: "ASC" } });
    return rows.map(({ id, code, name, address }) => ({ id, code, name, address }));
  }

  branchExists(branchId: string) {
    return this.dataSource.getRepository(BranchOrmEntity).exist({ where: { id: branchId } });
  }

  async listShelves(branchId: string) {
    const rows = await this.dataSource.getRepository(ShelfLocationOrmEntity).find({ where: { branchId }, order: { code: "ASC" } });
    return rows.map(({ id, code, label }) => ({ id, branchId, code, label }));
  }

  titleExists(bookTitleId: string) {
    return this.dataSource.getRepository(BookTitleOrmEntity).exist({ where: { id: bookTitleId } });
  }

  async listCopies(bookTitleId: string) {
    const rows = await this.dataSource.getRepository(BookCopyOrmEntity).find({ where: { bookTitleId }, order: { barcode: "ASC" } });
    return rows.map(({ id, barcode, rfid, branchId, shelfLocationId, status }) => ({
      id, bookTitleId, barcode, rfid, branchId, shelfLocationId, status,
    }));
  }
}
