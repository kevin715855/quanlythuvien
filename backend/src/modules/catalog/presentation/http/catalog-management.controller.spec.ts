import { ConflictException, NotFoundException } from "@nestjs/common";
import { CatalogConflictError, CatalogNotFoundError } from "../../application/errors/catalog-management.error";
import { CatalogManagementController } from "./catalog-management.controller";

describe("CatalogManagementController", () => {
  const ok = { id: "id-1" };
  const useCase = () => ({ execute: async () => ok });
  const controller = (override?: any) => new CatalogManagementController(
    (override ?? useCase()) as any, useCase() as any, useCase() as any,
    useCase() as any, useCase() as any, useCase() as any,
    useCase() as any, useCase() as any, useCase() as any,
  );

  it("adds authenticated staff id to title creation", async () => {
    let command: any;
    const instance = controller({ execute: async (value: any) => { command = value; return ok; } });
    await instance.createTitle({ title: "DDD", isbn: null, authors: ["Evans"], subjects: [], publisher: null }, "staff-1");
    expect(command).toMatchObject({ title: "DDD", actorId: "staff-1" });
  });

  it("maps conflict and missing errors", async () => {
    const conflict = controller({ execute: async () => { throw new CatalogConflictError("duplicate"); } });
    await expect(conflict.createTitle({} as any, "staff")).rejects.toBeInstanceOf(ConflictException);
    const missing = new CatalogManagementController(
      useCase() as any, { execute: async () => { throw new CatalogNotFoundError("BookTitle", "x"); } } as any,
      useCase() as any, useCase() as any, useCase() as any, useCase() as any,
      useCase() as any, useCase() as any, useCase() as any,
    );
    await expect(missing.updateTitle("x", {} as any, "staff")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("exposes branch, shelf, and copy queries", async () => {
    const branches = { execute: jest.fn().mockResolvedValue([{ id: "branch-1" }]) };
    const shelves = { execute: jest.fn().mockResolvedValue([{ id: "shelf-1" }]) };
    const copies = { execute: jest.fn().mockResolvedValue([{ id: "copy-1" }]) };
    const instance = new CatalogManagementController(
      useCase() as any, useCase() as any, useCase() as any, useCase() as any, useCase() as any, useCase() as any,
      branches as any, shelves as any, copies as any,
    );
    await expect(instance.listBranches()).resolves.toEqual([{ id: "branch-1" }]);
    await expect(instance.listShelves("branch-1")).resolves.toEqual([{ id: "shelf-1" }]);
    await expect(instance.listCopies("title-1")).resolves.toEqual([{ id: "copy-1" }]);
    expect(shelves.execute).toHaveBeenCalledWith("branch-1");
    expect(copies.execute).toHaveBeenCalledWith("title-1");
  });
});
