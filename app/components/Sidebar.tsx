"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Settings,
  Cpu,
  LayoutDashboard,
  Zap,
  FileText,
  Code,
  BookOpen,
  BookText,
  Puzzle,
  BarChart3,
} from "lucide-react";

const navSections = [
  {
    title: "IoT Builder",
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/things", label: "Things", icon: Settings },
      { href: "/devices", label: "Devices", icon: Cpu },
      { href: "/dashboard", label: "Dashboards", icon: LayoutDashboard },
      { href: "/triggers", label: "Triggers", icon: Zap },
      { href: "/templates", label: "Templates", icon: FileText },
    ],
  },
  {
    title: "Cloud Editor",
    items: [
      { href: "/sketches", label: "Sketches", icon: Code },
    ],
  },
  {
    title: "Learn & Explore",
    items: [
      { href: "/courses", label: "Courses", icon: BookOpen },
      { href: "/resources", label: "Resources", icon: BookText },
      { href: "/integrations", label: "Integrations", icon: Puzzle },
      { href: "/plan", label: "Plan Usage", icon: BarChart3 },
    ],
  },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {navSections.map((section) => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-section-title">{section.title}</div>
          <nav>
            <ul>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={isActive ? "active" : ""}>
                      <Icon className="nav-icon" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ))}
    </>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,151,100,0.15)" }}>
          <img src="/greenhouse-logo.png" alt="Greenhouse" width="24" height="24" style={{ objectFit: "contain" }} />
        </div>
        <span>Smart Green House</span>
      </div>

      <Suspense fallback={null}>
        <SidebarNav />
      </Suspense>

      <div className="sidebar-status">
        <div className="dot" />
        System Status
      </div>
    </aside>
  );
}
