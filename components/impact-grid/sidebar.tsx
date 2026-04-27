"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Truck,
  Users,
  Download,
  Menu,
  X,
  BarChart3,
} from "lucide-react"
import { DeployResponseBar } from "./deploy-response-bar"

const navItems = [
  { href: "/", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/missions", label: "MISSIONS", icon: FileText },
  { href: "/logistics", label: "LOGISTICS", icon: Truck },
  { href: "/personnel", label: "PERSONNEL", icon: Users },
  { href: "/analytics", label: "ANALYTICS", icon: BarChart3 },
  { href: "/reports", label: "REPORTS", icon: Download },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--tactical-orange)] rotate-45" />
          <span className="font-mono text-lg font-bold tracking-tight">
            <span className="text-[var(--tactical-orange)]">IMPACT</span>
            <span className="text-foreground">GRID</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Primary">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm font-mono text-xs tracking-wider transition-all duration-200",
                active
                  ? "bg-[var(--tactical-orange)]/10 text-[var(--tactical-orange)] border-l-2 border-[var(--tactical-orange)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
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
        <DeployResponseBar variant="inline" />
      </div>

      {/* Version Info */}
      <div className="p-4 border-t border-border">
        <p className="text-[10px] font-mono text-muted-foreground text-center">
          v1.0.0
        </p>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-card border border-border rounded-sm text-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-56 border-r border-border flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="relative h-full w-64 border-r border-border bg-sidebar animate-in slide-in-from-left duration-200"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
