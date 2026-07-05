import { render,screen } from "@testing-library/react";
import { describe,expect,it } from "vitest";
import { createTestServices } from "../../test/fakes";
import { ServicesProvider } from "../app/services-context";
import { BackupPage } from "./backup-page";
import { InventoryPage } from "./inventory-page";
describe("operations pages",()=>{it("renders inventory workflows",()=>{render(<ServicesProvider services={createTestServices()}><InventoryPage/></ServicesProvider>);expect(screen.getByText("Tạo phiên kiểm kê")).toBeInTheDocument();expect(screen.getByText("Mất / hỏng / thanh lý")).toBeInTheDocument();});it("loads the backup workspace",async()=>{render(<ServicesProvider services={createTestServices()}><BackupPage/></ServicesProvider>);expect(screen.getByRole("button",{name:"Tạo bản sao lưu"})).toBeInTheDocument();expect(await screen.findByText("Chưa có bản sao lưu.")).toBeInTheDocument();});});
