'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, Search, Settings, User, CheckSquare, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/approvals', label: 'Approvals', icon: CheckSquare },
  { href: '/search', label: 'Search', icon: Search },
];

const BOTTOM_NAV_ITEMS = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-surface md:flex h-screen sticky top-0">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]">
          <Brain size={14} className="text-white" />
        </div>
        <h2 className="text-lg font-display font-semibold tracking-tight text-white">TalentMind AI</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col justify-between">
        <nav className="px-4 space-y-8">
          <div className="space-y-1">
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Menu</p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-accent-blue/10 text-accent-blue" 
                      : "text-text-secondary hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <nav className="px-4 mt-auto">
          <div className="space-y-1">
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Preferences</p>
            {BOTTOM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-accent-blue/10 text-accent-blue" 
                      : "text-text-secondary hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
