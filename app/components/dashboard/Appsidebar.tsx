  import { CreditCard , BookText ,LayoutDashboard  } from "lucide-react"
  import Image from "next/image";

  import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
import Link from "next/link";

  // Menu items.
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",

      icon: LayoutDashboard,

    },
    {
      title: "Registeration Form",
      url: "/dashboard/regForm",
      icon: BookText,

    },
    {
      title: "Accomodation and payments",
      url: "/dashboard/Payments",
      icon: CreditCard,

    },
  //   {
  //     title: "Search",
  //     url: "#",
  //     icon: Search,
  //   },
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: Settings,
  //   },
  ]

  export function AppSidebar() {
    return (
      <Sidebar className="">
          <SidebarHeader>
              {/* Sidebar header with dark:invert image */}
              <Image
                className=" mx-auto" // Center the logo and invert in dark mode
                src="/logo2.png"
                alt="Next.js logo"
                width={180}
                height={38}
                priority
              />
            </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  }
