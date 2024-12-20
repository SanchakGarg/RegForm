import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/components/dashboard/Appsidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="p-1"><SidebarTrigger /></div>

      <main className="flex items-center justify-center h-screen w-screen">
        {children}
      </main>
    </SidebarProvider>
  )
}
