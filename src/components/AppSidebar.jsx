import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  CalendarCheck2,
  CheckCircle,
  LayoutDashboard,
  Lock,
  LogOut,
  Settings,
  Share2,
  User,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Statuslar", url: "/status", icon: CheckCircle },
  { title: "Leadlar", url: "/leadlar", icon: Users },
  { title: "Tasklar", url: "/tasks", icon: CalendarCheck2 },
  { title: "Lead manbasi", url: "/leadSource", icon: Share2 },
];

export default function AppSidebar() {
  const { state } = useSidebar(); // "expanded" | "collapsed"
  const isCollapsed = state === "collapsed";

  const storedData = localStorage.getItem("userData");
  const parsedData = JSON.parse(storedData);
  const { accessToken, user } = parsedData;

  if (storedData) {
    console.log("Access Token:", accessToken);
    console.log("User Email:", user.email);
    console.log("User Role:", user.role);
  } else {
    console.log("User data not found in localStorage.");
  }

  return (
    <Sidebar collapsible="icon" className="text-white">
      <SidebarContent className="flex h-full flex-col justify-between bg-[#07131d]">
        <SidebarGroup>
          {/* ── Logo ─────────────────────────────────────────────────── */}
          <SidebarGroupLabel
            className={`flex items-center gap-3 px-4 py-5 ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <img
              src="/ProHomeLogo.png"
              className={`shrink-0 transition-all ${isCollapsed ? "w-8" : "w-10"}`}
              alt="Pro Home"
            />
            {!isCollapsed && (
              <span className="text-lg font-bold text-white">Pro Home CRM</span>
            )}
          </SidebarGroupLabel>

          {/* ── Menu ─────────────────────────────────────────────────── */}
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
                          isCollapsed ? "justify-center px-2" : ""
                        } ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        }`
                      }
                    >
                      <item.icon
                        className={`shrink-0 transition-all ${
                          isCollapsed ? "h-7 w-7" : "h-6 w-6"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="text-base font-medium">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="px-2 py-4">
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Profile">
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `group mx-auto flex items-center justify-center rounded-lg px-5 hover:text-gray-900 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }`
                  }
                >
                  {user.role?.charAt(0)?.toUpperCase() || "U"}

                  {!isCollapsed && (
                    <div className="ml-3 flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-white hover:text-gray-900">
                        {user.role || "User"}
                      </span>
                      <span className="truncate text-xs text-gray-400">
                        {user.email || "—"}
                      </span>
                    </div>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <div className="h-[1px] bg-gray-300" />

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <NavLink
                  to="/login"
                  onClick={() => localStorage.clear()}
                  className={({ isActive }) =>
                    `group mx-auto flex items-center justify-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isCollapsed
                        ? "mx-0 px-2" // yopiq → markazda
                        : "mx-auto px-4" // ochiq → chapga
                    } ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }`
                  }
                >
                  <LogOut
                    className={`shrink-0 transition-all ${
                      isCollapsed ? "h-7 w-7" : "h-6 w-6"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="text-base font-medium">Logout</span>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
