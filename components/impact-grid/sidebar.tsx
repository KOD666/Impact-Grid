"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Truck,
  Users,
  Settings,
  Zap,
} from "lucide-react"

const navItems = [
  { href: "/", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/missions", label: "MISSIONS", icon: FileText },
  { href: "/logistics", label: "LOGISTICS", icon: Truck },
  { href: "/personnel", label: "PERSONNEL", icon: Users },
  { href: "/system", label: "SYSTEM", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--tactical-orange)] rotate-45" />
          <span className="font-mono text-lg font-bold tracking-tight">
            <span className="text-[var(--tactical-orange)]">IMPACT</span>
            <span className="text-foreground">GRID</span>
          </span>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground mt-1 tracking-wider">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--tactical-green)] mr-1.5 animate-pulse" />
          OPS_CENTER_01
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm font-mono text-xs tracking-wider transition-all duration-200",
                isActive
                  ? "bg-[var(--tactical-orange)]/10 text-[var(--tactical-orange)] border-l-2 border-[var(--tactical-orange)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Deploy Response Button */}
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold tracking-wider rounded-sm hover:brightness-110 transition-all">
          <Zap className="w-4 h-4" />
          DEPLOY RESPONSE
        </button>
      </div>

      {/* Agent Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center relative">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--tactical-green)] border-2 border-sidebar" />
          </div>
          <div>
            <p className="text-xs font-mono font-semibold">OPERATOR_08</p>
            <p className="text-[10px] font-mono text-muted-foreground">
              <span className="text-[var(--tactical-green)]">LVL4</span> CLEARANCE
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
