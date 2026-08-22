'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, Search, Settings, User, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/approvals', label: 'Approvals Queue', icon: ShieldCheck },
  { href: '/search', label: 'Vector Search', icon: Search },
];

const BOTTOM_NAV_ITEMS = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || 'Recruiter';

  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#090b12]/90 backdrop-blur-2xl md:flex h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/20">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-display font-bold tracking-tight text-text-primary leading-tight">TalentMind AI</h2>
          <p className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest font-semibold">Intelligence Workspace</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col justify-between px-4">
        <nav className="space-y-6">
          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted mb-3">Main Pipeline</p>
            <div className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}`));
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 group relative",
                      isActive 
                        ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                        : "text-text-secondary hover:bg-white/5 hover:text-white border border-transparent"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                    )}
                    <Icon size={16} className={cn("transition-transform group-hover:scale-110", isActive ? "text-indigo-400" : "text-text-muted")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom Navigation & Profile Badge */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <nav className="space-y-1.5">
            <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Preferences</p>
            {BOTTOM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200",
                    isActive 
                      ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30" 
                      : "text-text-secondary hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={16} className="text-text-muted" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Badge */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3 backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 font-bold text-white text-xs shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Session
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
