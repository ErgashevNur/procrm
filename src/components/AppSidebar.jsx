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
  Share2,
  ShoppingBag,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

// 🔑 Har bir menuga roles beramiz
const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["ROP", "SUPERADMIN"],
  },
  {
    title: "Leadlar",
    url: "/leadlar",
    icon: Users,
    roles: ["ROP", "SALESMANAGER", "SUPERADMIN"],
  },
  {
    title: "Tasklar",
    url: "/tasks",
    icon: CalendarCheck2,
    roles: ["SALESMANAGER", "ROP", "SUPERADMIN"],
  },
  {
    title: "Lead manbasi",
    url: "/leadSource",
    icon: Share2,
    roles: ["ROP", "SALESMANAGER", "SUPERADMIN"],
  },
  {
    title: "Statuslar",
    url: "/status",
    icon: CheckCircle,
    roles: ["ROP", "SUPERADMIN"],
  },
];

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Role olish
  let user = {};
  let role = "SALESMANAGER";
  try {
    const raw = localStorage.getItem("userData");
    if (raw) {
      const parsed = JSON.parse(raw);
      user = parsed.user || {};
      role = user.role || "SALESMANAGER";
    }
  } catch {}

  const visibleMenus = menuItems.filter((item) => item.roles.includes(role));

  return (
    <Sidebar collapsible="icon" className="text-white">
      <SidebarContent className="flex h-full flex-col justify-between bg-[#07131d]">
        <SidebarGroup>
          {/* Logo */}
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

          {/* Menu — faqat role ga mos itemlar */}
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="space-y-1">
              {visibleMenus.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
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

              {/* Pro market — hamma uchun lekin disabled */}
              <SidebarMenuItem key="pro-market">
                <SidebarMenuButton asChild tooltip="Pro market (Beta)" disabled>
                  <NavLink
                    to="#"
                    onClick={(e) => e.preventDefault()}
                    className="flex cursor-not-allowed items-center gap-4 rounded-lg px-4 py-3 opacity-60 transition-colors"
                  >
                    <ShoppingBag size={16} />
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium">
                          Pro market
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Beta
                        </span>
                        <Lock className="text-muted-foreground h-4 w-4" />
                      </div>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="px-2 py-4">
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Profile">
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `group mx-auto flex items-center justify-center rounded-lg px-5 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }`
                  }
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
                    {user.role?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  {!isCollapsed && (
                    <div className="ml-3 flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
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

            <div className="h-px bg-gray-300" />

            <SidebarMenuItem>
              <SidebarMenuButton
                className="hover:bg-red-600/50 hover:text-white"
                asChild
                tooltip="Logout"
              >
                <NavLink
                  to="/login"
                  onClick={() => localStorage.clear()}
                  className={({ isActive }) =>
                    `group mx-auto flex items-center justify-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isCollapsed ? "mx-0 px-2" : "mx-auto px-4"
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
