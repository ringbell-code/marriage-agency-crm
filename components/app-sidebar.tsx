"use client"

import * as React from "react"
import {
  Users,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"

const menuItems = [
  {
    title: "ダッシュボード",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "会員管理",
    url: "/",
    icon: Users,
  },
  {
    title: "面談スケジュール",
    url: "#",
    icon: Calendar,
    disabled: true,
  },
  {
    title: "メッセージ",
    url: "#",
    icon: MessageSquare,
    disabled: true,
  },
  {
    title: "分析レポート",
    url: "#",
    icon: BarChart3,
    disabled: true,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-violet-100 bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <img src="/ringbell-logo.svg" alt="Ringbell Logo" className="h-8 w-auto" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">Marriage CRM</span>
            <span className="text-xs text-gray-500">結婚相談所管理</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs font-medium px-2">メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild disabled={item.disabled} className="text-gray-600 hover:bg-violet-50 hover:text-violet-600 data-[active=true]:bg-gradient-to-r data-[active=true]:from-violet-500 data-[active=true]:to-purple-600 data-[active=true]:text-white rounded-xl transition-all duration-200">
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-violet-100 bg-white p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-gray-600 hover:bg-violet-50 hover:text-violet-600 rounded-xl transition-all duration-200">
              <Link href="#">
                <Settings className="h-4 w-4" />
                <span className="font-medium">設定</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
