import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Mijozlar from "./pages/mijozlar";
import Status from "./pages/status";
import AddStatus from "./pages/addStatus";
import Profile from "./pages/profile";
import Projects from "./pages/loyhalar";
import Setting from "./pages/settings";
import Tasks from "./pages/task";
import LeadSource from "./pages/leadSource";
import LeadDetails from "./pages/leadDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import AppSidebar from "./components/AppSidebar";
import Header from "./components/Header";
import { Toaster } from "sonner";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

// 403 sahifasi
function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f2231] text-center">
      <p className="mb-3 text-7xl font-black text-[#162840]">403</p>
      <p className="mb-2 text-lg font-semibold text-white">Ruxsat yo'q</p>
      <p className="mb-8 text-sm text-[#456070]">
        Bu sahifani ko'rish uchun sizda yetarli huquq yo'q.
      </p>
      <button
        onClick={() => window.history.back()}
        className="rounded border border-[#2a4560] bg-[#1a2e40] px-5 py-2 text-sm text-[#9ab8cc] transition-colors hover:border-[#3a5570]"
      >
        ← Orqaga
      </button>
    </div>
  );
}

export function ProtectedLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full bg-gray-700">
        <AppSidebar />
        <SidebarInset className="flex flex-col bg-[#153043]">
          <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-2 bg-[#153043] px-4 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1 p-1 text-2xl text-white" />
            <Header />
          </header>
          <main className="flex-1 overflow-auto bg-[#0f2231]">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/403",
    element: <Forbidden />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "tasks",
        element: <Tasks />,
      },
      {
        path: "leadDetails",
        element: <LeadDetails />,
      },

      // ✅ Faqat ROP, SALESMANAGER va SUPERADMIN
      {
        path: "leadlar",
        element: (
          <ProtectedRoute allowedRoles={["ROP", "SALESMANAGER", "SUPERADMIN"]}>
            <Mijozlar />
          </ProtectedRoute>
        ),
      },
      {
        path: "leadSource",
        element: (
          <ProtectedRoute allowedRoles={["ROP", "SALESMANAGER", "SUPERADMIN"]}>
            <LeadSource />
          </ProtectedRoute>
        ),
      },
      {
        path: "status",
        element: (
          <ProtectedRoute allowedRoles={["ROP", "SALESMANAGER", "SUPERADMIN"]}>
            <Status />
          </ProtectedRoute>
        ),
      },
      {
        path: "addStatus",
        element: (
          <ProtectedRoute allowedRoles={["ROP", "SUPERADMIN"]}>
            <AddStatus />
          </ProtectedRoute>
        ),
      },

      // ✅ Faqat ROP, SUPERADMIN
      {
        path: "setting",
        element: (
          <ProtectedRoute allowedRoles={["ROP", "SUPERADMIN"]}>
            <Setting />
          </ProtectedRoute>
        ),
      },
      {
        path: "projects",
        element: (
          <ProtectedRoute allowedRoles={["ROP", "SUPERADMIN"]}>
            <Projects />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
