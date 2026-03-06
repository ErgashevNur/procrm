import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Mijozlar from "./pages/mijozlar";
import Profile from "./pages/profile";
import Projects from "./pages/project";
import Kanban from "./pages/kanban";
import Setting from "./pages/settings";
import Tasks from "./pages/task";
import LeadSource from "./pages/leadSource";
import LeadDetails from "./pages/leadDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectGate from "./components/ProjectGate";
import AppSidebar from "./components/AppSidebar";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SmsRassilka from "./pages/smsRassilka";
import {
  getCurrentRole,
  getDefaultRouteByRole,
  isSupportedRole,
  ROLES,
} from "@/lib/rbac";
import AddStatus from "./pages/addStatus";

const MANAGEMENT_ROLES = [ROLES.ROP, ROLES.SUPERADMIN];
const CRM_ROLES = [ROLES.ROP, ROLES.SALESMANAGER, ROLES.SUPERADMIN];

function RoleHomeRedirect() {
  const role = getCurrentRole();
  if (!isSupportedRole(role)) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDefaultRouteByRole(role)} replace />;
}

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
      <div className="flex w-full overflow-hidden bg-gray-700">
        <AppSidebar />
        <SidebarInset className="flex flex-col overflow-hidden bg-[#153043]">
          <main
            className="flex-1 overflow-y-auto bg-[#0f2231]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),
                      linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          >
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
        element: <RoleHomeRedirect />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            <ProjectGate>
              <Dashboard />
            </ProjectGate>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "kanban",
        element: (
          <ProjectGate>
            <Kanban />
          </ProjectGate>
        ),
      },
      {
        path: "tasks",
        element: (
          <ProjectGate>
            <Tasks />
          </ProjectGate>
        ),
      },
      {
        path: "leadDetails",
        element: (
          <ProjectGate>
            <LeadDetails />
          </ProjectGate>
        ),
      },

      {
        path: "leadlar",
        element: (
          <ProtectedRoute allowedRoles={CRM_ROLES}>
            <ProjectGate>
              <Mijozlar />
            </ProjectGate>
          </ProtectedRoute>
        ),
      },

      {
        path: "addStatus",
        element: (
          <ProtectedRoute allowedRoles={CRM_ROLES}>
            <ProjectGate>
              <AddStatus />
            </ProjectGate>
          </ProtectedRoute>
        ),
      },

      {
        path: "leadSource",
        element: (
          <ProtectedRoute allowedRoles={CRM_ROLES}>
            <ProjectGate>
              <LeadSource />
            </ProjectGate>
          </ProtectedRoute>
        ),
      },
      {
        path: "setting",
        element: (
          <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            <Setting />
          </ProtectedRoute>
        ),
      },
      {
        path: "projects",
        element: (
          <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            <Projects />
          </ProtectedRoute>
        ),
      },
      {
        path: "rassilka",
        element: (
          <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            <ProjectGate>
              <SmsRassilka />
            </ProjectGate>
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <RoleHomeRedirect />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
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
