"use client"

import { Bell, User, Users, LayoutDashboard, Calendar, MessageSquare, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "ダッシュボード",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "会員管理",
    url: "/members",
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

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-6 border-b-2 border-gray-200 bg-white px-6">
      {/* ロゴ */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
      </Link>

      {/* ナビゲーションメニュー */}
      <nav className="flex items-center gap-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url && item.url !== "#"
          
          return (
            <Link
              key={item.title}
              href={item.disabled ? "#" : item.url}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                item.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* 右側のアクション */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-lg">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        
        <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-lg">
          <Settings className="h-5 w-5 text-gray-600" />
        </Button>

        <Avatar className="h-9 w-9 border-2 border-gray-200">
          <AvatarFallback className="bg-gray-100">
            <User className="h-4 w-4 text-gray-700" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
