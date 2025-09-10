import { NavLink } from "react-router-dom"
import { BookOpen, Archive, Mic, Workflow, ArrowRight, Library } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { useGetDashboardStats } from "../hooks/dashboard/useGetDashboardStats"

const Index = () => {
  const { data: stats = { totalPrompts: 0, totalAutomations: 0, totalCoaches: 0, totalContexts: 0, activeAutomations: 0 }, isLoading } = useGetDashboardStats()

  const features = [
    { title: "Prompt Library", description: "Create and organize AI prompts", icon: BookOpen, url: "/prompts", stats: `${stats.totalPrompts} prompts` },
    { title: "Context Hub", description: "Manage reusable context snippets", icon: Library, url: "/context-hub", stats: `${stats.totalContexts} contexts` },
    { title: "Asset Hub", description: "Manage your digital assets", icon: Archive, url: "/assets", stats: "Secure storage" },
    { title: "Coach Hub", description: "AI voice coaching sessions", icon: Mic, url: "/coaches", stats: `${stats.totalCoaches} coaches` },
    { title: "Automation Hub", description: "Run workflows via n8n", icon: Workflow, url: "/automations", stats: `${stats.totalAutomations} automations` },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">Overview of your prompts, contexts, assets, coaching and automations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="animate-pulse bg-muted rounded-full h-6 w-20"></div>
            <div className="animate-pulse bg-muted rounded-full h-6 w-20"></div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your prompts, contexts, assets, coaching and automations</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Active automations: {stats.activeAutomations}</Badge>
          <Badge variant="outline">Resources: {stats.totalPrompts + stats.totalAutomations}</Badge>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                      <f.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate" title={f.title}>{f.title}</CardTitle>
                      <CardDescription className="text-xs truncate">{f.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{f.stats}</p>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <NavLink to={f.url}>
                      Open <ArrowRight className="h-3 w-3" />
                    </NavLink>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;