import { BadRequestException, Body, ConflictException, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@common/enums/role.enum";
import { CatalogConflictError, CatalogDomainError, CatalogManagementError, CatalogNotFoundError } from "../../application/errors/catalog-management.error";
import { CreateBookCopyUseCase, CreateBookTitleUseCase, CreateBranchUseCase, CreateShelfLocationUseCase, UpdateBookCopyUseCase, UpdateBookTitleUseCase } from "../../application/use-cases/catalog-management.use-cases";
import { ListBranchesUseCase, ListCopiesUseCase, ListShelvesUseCase } from "../../application/use-cases/catalog-query.use-cases";
import { CreateBookCopyDto, CreateBookTitleDto, CreateBranchDto, CreateShelfDto, UpdateBookCopyDto, UpdateBookTitleDto } from "./dto/catalog-management.dto";

@Roles(Role.STAFF)
@Controller("catalog")
export class CatalogManagementController {
  constructor(
    private createBookTitle: CreateBookTitleUseCase, private updateBookTitle: UpdateBookTitleUseCase,
    private createBranchUseCase: CreateBranchUseCase, private createShelfUseCase: CreateShelfLocationUseCase,
    private createBookCopy: CreateBookCopyUseCase, private updateBookCopy: UpdateBookCopyUseCase,
    private listBranchesUseCase: ListBranchesUseCase, private listShelvesUseCase: ListShelvesUseCase,
    private listCopiesUseCase: ListCopiesUseCase,
  ) {}
  @Post("titles") createTitle(@Body() body: CreateBookTitleDto, @CurrentUser("id") actorId: string) { return this.handle(() => this.createBookTitle.execute({ ...body, actorId })); }
  @Patch("titles/:id") updateTitle(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateBookTitleDto, @CurrentUser("id") actorId: string) { return this.handle(() => this.updateBookTitle.execute({ ...body, id, actorId })); }
  @Post("branches") createBranch(@Body() body: CreateBranchDto, @CurrentUser("id") actorId: string) { return this.handle(() => this.createBranchUseCase.execute({ ...body, actorId })); }
  @Post("branches/:branchId/shelves") createShelf(@Param("branchId", ParseUUIDPipe) branchId: string, @Body() body: CreateShelfDto, @CurrentUser("id") actorId: string) { return this.handle(() => this.createShelfUseCase.execute({ ...body, branchId, actorId })); }
  @Post("copies") createCopy(@Body() body: CreateBookCopyDto, @CurrentUser("id") actorId: string) { return this.handle(() => this.createBookCopy.execute({ ...body, actorId })); }
  @Patch("copies/:id") updateCopy(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateBookCopyDto, @CurrentUser("id") actorId: string) { return this.handle(() => this.updateBookCopy.execute({ ...body, id, actorId })); }
  @Get("branches") listBranches() { return this.handle(() => this.listBranchesUseCase.execute()); }
  @Get("branches/:branchId/shelves") listShelves(@Param("branchId", ParseUUIDPipe) branchId: string) { return this.handle(() => this.listShelvesUseCase.execute(branchId)); }
  @Get("titles/:bookTitleId/copies") listCopies(@Param("bookTitleId", ParseUUIDPipe) bookTitleId: string) { return this.handle(() => this.listCopiesUseCase.execute(bookTitleId)); }
  private async handle<T>(work: () => Promise<T>): Promise<T> {
    try { return await work(); }
    catch (error) {
      if (error instanceof CatalogNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof CatalogConflictError) throw new ConflictException(error.message);
      if (error instanceof CatalogDomainError || error instanceof CatalogManagementError) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
