import { createBrowserRouter, Outlet } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { ExplorePage } from "./pages/explore-page";
import { CategoryPage } from "./pages/category-page";
import { ItemDetailPage } from "./pages/item-detail-page";
import { UserDashboard } from "./pages/user-dashboard";
import { LenderDashboard } from "./pages/lender-dashboard";
import { AdminPanel } from "./pages/admin-panel";
import { LoginPage } from "./pages/login-page";
import { SignupPage } from "./pages/signup-page";
import { CreateItemPage } from "./pages/create-item-page";
import { EditItemPage } from "./pages/edit-item-page";
import { CGUPage, PrivacyPolicyPage, LegalNoticePage } from "./pages/legal-pages";
import { ProtectedRoute, GuestRoute, AdminRoute, LenderRoute, ClientRoute } from "./components/shared/protected-route";
import { MainLayout } from "./components/layout/main-layout";

export const router = createBrowserRouter([
  {
    Component: MainLayout,
    children: [
      // ─── Public Routes ─────────────────────────────────
      {
        path: "/",
        Component: LandingPage,
      },
      {
        path: "/explore",
        Component: ExplorePage,
      },
      {
        path: "/category/:categoryName",
        Component: CategoryPage,
      },
      {
        path: "/item/:itemId",
        Component: ItemDetailPage,
      },
      {
        path: "/cgu",
        Component: CGUPage,
      },
      {
        path: "/privacy",
        Component: PrivacyPolicyPage,
      },
      {
        path: "/legal",
        Component: LegalNoticePage,
      },

      // ─── Guest Only Routes (redirect if logged in) ────
      {
        Component: GuestRoute,
        children: [
          {
            path: "/login",
            Component: LoginPage,
          },
          {
            path: "/signup",
            Component: SignupPage,
          },
        ],
      },

      // ─── Protected Routes (require auth) ──────────────
      {
        Component: ClientRoute,
        children: [
          {
            path: "/dashboard",
            Component: UserDashboard,
          },
        ],
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "/create",
            Component: CreateItemPage,
          },
          {
            path: "/edit-item/:id",
            Component: EditItemPage,
          },
        ],
      },
      {
        Component: LenderRoute,
        children: [
          {
            path: "/lender",
            Component: LenderDashboard,
          },
        ],
      },

      // ─── Admin Routes (require admin role) ────────────
      {
        Component: AdminRoute,
        children: [
          {
            path: "/admin",
            Component: AdminPanel,
          },
        ],
      },
    ]
  }
]);
