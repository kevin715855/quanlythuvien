import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { AppServices } from "../../application/services";
import { AppShell } from "../layouts/app-shell";
import { AdminPage } from "../pages/admin-page";
import { BackupPage } from "../pages/backup-page";
import { InventoryPage } from "../pages/inventory-page";
import { ReaderPortalPage } from "../pages/reader-portal-page";
import { PublicCatalogPage } from "../pages/public-catalog-page";
import { BillingPage } from "../pages/billing-page";
import { DashboardPage } from "../pages/dashboard-page";
import { CirculationPage } from "../pages/circulation-page";
import { CatalogPage } from "../pages/catalog-page";
import { LoginPage } from "../pages/login-page";
import { ReadersPage } from "../pages/readers-page";
import { ReservationsPage } from "../pages/reservations-page";
import { AuthProvider } from "./auth-context";
import { ProtectedRoute } from "./protected-route";
import { RoleRoute } from "./role-route";
import { ServicesProvider } from "./services-context";

export function App({ services }: { services: AppServices }) {
  return (
    <ServicesProvider services={services}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search" element={<PublicCatalogPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route element={<RoleRoute roles={["admin", "staff"]} fallback="/login" />}><Route path="/dashboard" element={<DashboardPage />} /></Route>
                <Route element={<RoleRoute roles={["staff"]} />}>
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/readers" element={<ReadersPage />} />
                  <Route path="/circulation" element={<CirculationPage />} />
                  <Route path="/reservations" element={<ReservationsPage />} />
                  <Route path="/billing" element={<BillingPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                </Route>
                <Route element={<RoleRoute roles={["admin"]} />}><Route path="/admin" element={<AdminPage />} /><Route path="/backups" element={<BackupPage />} /></Route>
                <Route element={<RoleRoute roles={["reader"]} fallback="/login" />}><Route path="/reader" element={<ReaderPortalPage />} /></Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ServicesProvider>
  );
}
