import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectGate from "./components/ProjectGate";
import AppSidebar from "./components/AppSidebar";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  getCurrentRole,
  getDefaultRouteByRole,
  isSupportedRole,
  ROLES,
} from "@/lib/rbac";

const Dashboard = lazy(() => import("./pages/dashboard"));
const Login = lazy(() => import("./pages/login"));
const Mijozlar = lazy(() => import("./pages/mijozlar"));
const Profile = lazy(() => import("./pages/profile"));
const Projects = lazy(() => import("./pages/project"));
const Kanban = lazy(() => import("./pages/kanban"));
const Setting = lazy(() => import("./pages/settings"));
const Tasks = lazy(() => import("./pages/task"));
const LeadSource = lazy(() => import("./pages/leadSource"));
const LeadDetails = lazy(() => import("./pages/leadDetails"));
const SmsRassilka = lazy(() => import("./pages/smsRassilka"));
const AddStatus = lazy(() => import("./pages/addStatus"));
const Analitika = lazy(() => import("./pages/analitika"));
const AppErrorFallback = lazy(() => import("./pages/error"));

const MANAGEMENT_ROLES = [ROLES.ROP, ROLES.SUPERADMIN];
const CRM_ROLES = [ROLES.ROP, ROLES.SALESMANAGER, ROLES.SUPERADMIN];

function RouteLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#9ab8cc]">
      Yuklanmoqda...
    </div>
  );
}

function withLazy(component) {
  return <Suspense fallback={<RouteLoader />}>{component}</Suspense>;
}

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
    <SidebarProvider defaultOpen={false}>
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
    element: withLazy(<Login />),
    errorElement: withLazy(<AppErrorFallback />),
  },
  {
    path: "/403",
    element: <Forbidden />,
  },
  {
    path: "/",
    errorElement: withLazy(<AppErrorFallback />),
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
          <ProtectedRoute allowedRoles={CRM_ROLES}>
            <ProjectGate>
              {withLazy(<Dashboard />)}
            </ProjectGate>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: withLazy(<Profile />),
      },
      {
        path: "kanban",
        element: (
          <ProjectGate>
            {withLazy(<Kanban />)}
          </ProjectGate>
        ),
      },
      {
        path: "tasks",
        element: (
          <ProjectGate>
            {withLazy(<Tasks />)}
          </ProjectGate>
        ),
      },
      {
        path: "leadDetails",
        element: (
          <ProjectGate>
            {withLazy(<LeadDetails />)}
          </ProjectGate>
        ),
      },

      {
        path: "leadlar",
        element: (
          <ProtectedRoute allowedRoles={CRM_ROLES}>
            <ProjectGate>
              {withLazy(<Mijozlar />)}
            </ProjectGate>
          </ProtectedRoute>
        ),
      },

      {
        path: "addStatus",
        element: (
          <ProtectedRoute allowedRoles={CRM_ROLES}>
            <ProjectGate>
              {withLazy(<AddStatus />)}
            </ProjectGate>
          </ProtectedRoute>
        ),
      },

      {
        path: "leadSource",
        element: (
          <ProtectedRoute allowedRoles={CRM_ROLES}>
            <ProjectGate>
              {withLazy(<LeadSource />)}
            </ProjectGate>
          </ProtectedRoute>
        ),
      },
      {
        path: "setting",
        element: (
          <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            {withLazy(<Setting />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "projects",
        element: (
          <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
            {withLazy(<Projects />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "rassilka",
        element: (
          <ProtectedRoute allowedRoles={CRM_ROLES}>
            <ProjectGate>
              {withLazy(<SmsRassilka />)}
            </ProjectGate>
          </ProtectedRoute>
        ),
      },
      {
        path: "analitika",
        element: (
          <ProtectedRoute allowedRoles={CRM_ROLES}>
            <ProjectGate>
              {withLazy(<Analitika />)}
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
    errorElement: withLazy(<AppErrorFallback />),
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
