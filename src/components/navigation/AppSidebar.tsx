import { NavLink } from "react-router-dom"
import { 
  BookOpen, 
  Archive, 
  Mic, 
  Workflow,
  FileText,
  Menu,
  LogOut
} from "lucide-react"
import { Button } from "../ui/button"
import { useAuth } from "../../hooks/auth/useAuth"
import { ThemeToggle } from "../theme/ThemeToggle"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "../ui/sidebar"

const navigationItems = [
  {
    title: "Prompt Library",
    url: "/prompts",
    icon: BookOpen,
    description: "AI prompts & templates"
  },
  {
    title: "Context Hub",
    url: "/contexts",
    icon: FileText,
    description: "Reusable context documents"
  },
  {
    title: "Asset Hub",
    url: "/assets",
    icon: Archive,
    description: "Digital asset storage"
  },
  {
    title: "Coach Hub",
    url: "/coaches",
    icon: Mic,
    description: "AI voice coaches"
  },
  {
    title: "Automation Hub",
    url: "/automations",
    icon: Workflow,
    description: "AI workflow automation"
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const { signOut, user } = useAuth()
  const isCollapsed = state === "collapsed"

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-sidebar-foreground font-semibold text-lg">Acelo</h2>
              <p className="text-xs text-sidebar-foreground/60">Management Suite</p>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-2">
            {!isCollapsed ? "Main Features" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="group transition-all duration-200 hover:bg-sidebar-accent rounded-lg"
                  >
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 ${
                          isActive 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                            : "text-sidebar-foreground hover:text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon 
                        className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`}
                      />
                      {!isCollapsed && (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{item.title}</span>
                          <span className="text-xs opacity-70">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="space-y-3">
            {!isCollapsed && (
              <div className="text-xs text-sidebar-foreground/60 px-2">
                {user.email}
              </div>
            )}
            <div className="flex gap-2">
              <ThemeToggle />
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                className={`${isCollapsed ? 'flex-1' : 'flex-1'} text-sidebar-foreground hover:bg-sidebar-accent`}
              >
                <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
                {!isCollapsed && "Sign Out"}
              </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}