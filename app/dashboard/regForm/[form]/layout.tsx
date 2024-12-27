import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/components/dashboard/Appsidebar"
import { Toaster } from "@/components/ui/toaster"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
   <div className="w-full h-screen">
    
    <main className="flex items-center justify-center h-screen w-screen">
        {children}
      </main>
      <Toaster />
   </div>


  )
}
