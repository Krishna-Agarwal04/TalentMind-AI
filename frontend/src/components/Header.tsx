'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Moon, Sun, User, Settings, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
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

  // Close dropdowns on outside click
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
  const userRole = user?.role || 'RECRUITER';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-background/80 px-6 backdrop-blur-md">
      <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center">
        <div className="w-full">
          <Input 
            placeholder="Search candidates, jobs..." 
            leftIcon={<Search size={18} />} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 bg-white/5 border-transparent focus-visible:bg-white/10 text-white"
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme} 
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-blue ring-2 ring-background" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-surface p-4 shadow-2xl backdrop-blur-xl z-50">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <span className="font-semibold text-sm text-white">Notifications</span>
                <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">System Live</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                  <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-white">ML Pipeline Online</p>
                    <p className="text-text-muted mt-0.5">FAISS & Cross-Encoder engines ready for ranking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                  <ShieldAlert size={16} className="text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-white">Human-In-The-Loop Active</p>
                    <p className="text-text-muted mt-0.5">All agent actions gated by approval queue.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative pl-4 border-l border-white/10" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 rounded-lg p-1 hover:bg-white/5 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white text-xs shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden flex-col md:flex text-left">
              <span className="text-sm font-medium text-text-primary leading-none">{userName}</span>
              <span className="text-xs text-text-secondary mt-1">{userRole}</span>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-surface p-2 shadow-2xl backdrop-blur-xl z-50">
              <div className="border-b border-white/10 p-3 mb-1">
                <p className="font-semibold text-sm text-white">{userName}</p>
                <p className="text-xs text-text-muted truncate">{userEmail}</p>
              </div>
              <button 
                onClick={() => { setIsDropdownOpen(false); router.push('/profile'); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
              >
                <User size={14} /> Profile
              </button>
              <button 
                onClick={() => { setIsDropdownOpen(false); router.push('/settings'); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
              >
                <Settings size={14} /> Settings
              </button>
              <div className="my-1 border-t border-white/10" />
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error/10 transition-colors"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
