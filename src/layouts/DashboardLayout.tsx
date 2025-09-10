import { Outlet, NavLink } from "react-router-dom"
import { Menu, Bell, User } from "lucide-react"
import { Button } from "../components/ui/button"
import { 
  SidebarProvider, 
  SidebarTrigger,
  useSidebar 
} from "../components/ui/sidebar"
import { AppSidebar } from "../components/navigation/AppSidebar"

function DashboardHeader() {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="p-2 hover:bg-accent rounded-lg transition-colors" />
          <NavLink to="/" className="hidden md:block hover:opacity-80 transition-opacity">
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          </NavLink>
        </div>
        
        <div></div>
      </div>
    </header>
  )
}

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}