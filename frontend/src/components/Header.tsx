'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Moon, Sun, User, Settings, LogOut, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useAuth } from '@/providers/AuthProvider';
import { Input } from './ui/Input';

export function Header() {
  const { isDark, toggleTheme } = useThemeStore();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Recruiter';
  const userEmail = user?.email || 'recruiter@example.com';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#090b12]/80 px-6 backdrop-blur-2xl">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center">
        <div className="w-full">
          <Input 
            placeholder="Search candidates, skills, job titles..." 
            leftIcon={<Search size={16} className="text-text-muted" />} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 bg-white/5 border-white/10 focus-visible:bg-white/10 text-xs text-white rounded-xl placeholder:text-text-muted"
          />
        </div>
      </form>

      {/* System Telemetry & Controls */}
      <div className="flex items-center gap-4">
        {/* Live Engine Status Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <Activity size={12} />
          <span>FAISS Engine Ready</span>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white transition-all"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white transition-all"
          >
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[#090b12]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-[#0e111a] p-4 shadow-2xl backdrop-blur-2xl z-50">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">System Telemetry</span>
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Active</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Deterministic Pipeline Active</p>
                    <p className="text-text-muted text-[11px] mt-0.5">FAISS Retrieval & Cross-Encoder re-ranking operational.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                  <ShieldCheck size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Human-In-The-Loop Boundary</p>
                    <p className="text-text-muted text-[11px] mt-0.5">Action proposals require recruiter manual approval.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative pl-3 border-l border-white/10" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-white/5 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white text-xs shadow-md border border-white/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden flex-col md:flex text-left">
              <span className="text-xs font-bold text-white leading-none">{userName}</span>
              <span className="text-[10px] font-mono text-text-muted mt-1 uppercase">Recruiter Lead</span>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0e111a] p-2 shadow-2xl backdrop-blur-2xl z-50">
              <div className="border-b border-white/10 p-3 mb-1">
                <p className="font-semibold text-xs text-white">{userName}</p>
                <p className="text-[11px] font-mono text-text-muted truncate mt-0.5">{userEmail}</p>
              </div>
              <button 
                onClick={() => { setIsDropdownOpen(false); router.push('/profile'); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
              >
                <User size={14} /> Profile
              </button>
              <button 
                onClick={() => { setIsDropdownOpen(false); router.push('/settings'); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
              >
                <Settings size={14} /> Settings
              </button>
              <div className="my-1 border-t border-white/10" />
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
