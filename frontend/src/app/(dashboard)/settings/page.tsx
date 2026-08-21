'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useThemeStore } from '@/store/themeStore';
import { Moon, Sun, Monitor, Bell, Shield, Key, CheckCircle2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useThemeStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [hitlAlerts, setHitlAlerts] = useState(true);
  const [apiKey, setApiKey] = useState('tm_live_9f8a7b6c5d4e3f2a1b0c9d8e');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-2 text-text-secondary">Manage your system settings, notification rules, and security preferences.</p>
      </div>

      {savedSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-500 font-medium">
          <CheckCircle2 size={18} /> Settings updated successfully!
        </motion.div>
      )}

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-64">
          <nav className="flex flex-col space-y-1">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-500/10 text-blue-500 font-semibold' 
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-white/10 bg-surface">
                <CardHeader className="border-b border-white/10 bg-white/5">
                  <CardTitle className="text-text-primary">Appearance Preference</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary">Theme Mode</h3>
                      <p className="mt-1 text-sm text-text-secondary">Choose between light and dark visual mode.</p>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-white/10 p-1 bg-white/5">
                      <button 
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                          !isDark ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'
                        }`}
                        onClick={() => isDark && toggleTheme()}
                      >
                        <Sun size={18} />
                        <span className="text-sm font-medium">Light</span>
                      </button>
                      <button 
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                          isDark ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'
                        }`}
                        onClick={() => !isDark && toggleTheme()}
                      >
                        <Moon size={18} />
                        <span className="text-sm font-medium">Dark</span>
                      </button>
                    </div>
                  </div>

                  <div className="my-8 h-px w-full bg-white/10" />

                  <div className="flex justify-end">
                    <Button isLoading={isSaving} onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Save Preference</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-white/10 bg-surface">
                <CardHeader className="border-b border-white/10 bg-white/5">
                  <CardTitle className="text-text-primary">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-text-primary">Human-In-The-Loop Approval Alerts</h4>
                      <p className="text-sm text-text-secondary">Get notified instantly when the AI agent proposes a candidate action.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={hitlAlerts} 
                      onChange={(e) => setHitlAlerts(e.target.checked)}
                      className="h-5 w-5 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="my-4 h-px w-full bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-text-primary">Email Digest & Activity Summary</h4>
                      <p className="text-sm text-text-secondary">Receive daily summaries of top ranked candidates and active requisitions.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={emailNotifs} 
                      onChange={(e) => setEmailNotifs(e.target.checked)}
                      className="h-5 w-5 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500" 
                    />
                  </div>

                  <div className="my-8 h-px w-full bg-white/10" />

                  <div className="flex justify-end">
                    <Button isLoading={isSaving} onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Save Notification Rules</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-white/10 bg-surface">
                <CardHeader className="border-b border-white/10 bg-white/5">
                  <CardTitle className="text-text-primary">Security & Access Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-4">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                  </div>

                  <div className="my-8 h-px w-full bg-white/10" />

                  <div className="flex justify-end">
                    <Button isLoading={isSaving} onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Update Password</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-white/10 bg-surface">
                <CardHeader className="border-b border-white/10 bg-white/5">
                  <CardTitle className="text-text-primary">API Credentials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Secret API Token</h4>
                    <p className="text-sm text-text-secondary mb-4">Use this token to authenticate external webhooks and ATS integrations.</p>
                    <div className="flex gap-2">
                      <Input value={apiKey} readOnly className="font-mono text-sm" />
                      <Button variant="secondary" onClick={copyApiKey} leftIcon={<Copy size={16} />}>
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  <div className="my-8 h-px w-full bg-white/10" />

                  <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setApiKey(`tm_live_${Math.random().toString(36).substring(2,15)}`)}>
                      Roll Key
                    </Button>
                    <Button isLoading={isSaving} onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Save Key Config</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
