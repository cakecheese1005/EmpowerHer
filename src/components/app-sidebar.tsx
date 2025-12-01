"use client"

import {
  BookOpen,
  FilePlus2,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"

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
  const router = useRouter()
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || 'user@email.com'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

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
                    <AvatarImage src={user?.photoURL || undefined} alt={userName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-sidebar-foreground">{userName}</span>
                    <span className="text-muted-foreground">{userEmail}</span>
                </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-sidebar-foreground group-data-[collapsible=icon]:w-full"
              onClick={handleLogout}
            >
                <LogOut />
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
