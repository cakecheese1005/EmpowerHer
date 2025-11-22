"use client"

import {
  BookOpen,
  FilePlus2,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react"

import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Logo } from "./logo"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"

const menuItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/assessment",
    icon: FilePlus2,
    label: "New Assessment",
  },
  {
    href: "/recommendations",
    icon: HeartPulse,
    label: "Recommendations",
  },
  {
    href: "/knowledge-hub",
    icon: BookOpen,
    label: "Knowledge Hub",
  },
  {
    href: "/profile",
    icon: User,
    label: "Profile",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon" side="left">
      <SidebarHeader className="justify-between">
        <Logo textClassName="text-sidebar-foreground" />
        <SidebarTrigger className="text-sidebar-foreground" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex-col gap-4">
        <Separator className="bg-sidebar-border" />
        <div className="flex items-center justify-between gap-2 p-2">
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://picsum.photos/seed/user-avatar/100/100" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-sidebar-foreground">User Name</span>
                    <span className="text-muted-foreground">user@email.com</span>
                </div>
            </div>
            <Button asChild variant="ghost" size="icon" className="text-sidebar-foreground group-data-[collapsible=icon]:w-full">
                <Link href="/">
                    <LogOut />
                </Link>
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
