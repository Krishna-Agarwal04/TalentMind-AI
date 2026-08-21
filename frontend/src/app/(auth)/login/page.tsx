'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { authApi } from '@/features/auth/api';
import { getApiBaseUrl } from '@/lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login({ email, password });
      login(data.access_token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      if (err?.response) {
        const detail = err.response.data?.detail;
        setError(typeof detail === 'string' ? detail : 'Failed to login');
      } else {
        console.error(`[auth] Login request failed. API base URL = ${getApiBaseUrl()}`, err);
        setError(
          `Cannot reach the server at ${getApiBaseUrl()}. ` +
            'Check that NEXT_PUBLIC_API_URL points to your backend and that the backend is running.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFillDemo = () => {
    setEmail('recruiter@talentmind.ai');
    setPassword('password123');
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center md:text-left">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-text-secondary">Enter your credentials to access the TalentMind AI Recruiter Dashboard.</p>
      </div>

      {/* Demo Credentials Box */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Sparkles size={14} /> Quick Demo Access
          </div>
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">1-Click</span>
        </div>
        <div className="mt-2.5 space-y-1 font-mono text-xs text-text-secondary">
          <p className="flex justify-between"><span className="text-text-muted">Email:</span> <span className="font-semibold text-white">recruiter@talentmind.ai</span></p>
          <p className="flex justify-between"><span className="text-text-muted">Password:</span> <span className="font-semibold text-white">password123</span></p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3 w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
          leftIcon={<KeyRound size={14} />}
          onClick={handleAutoFillDemo}
        >
          Auto-Fill Demo Credentials
        </Button>
      </div>

      <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
        {error && <div className="rounded-md bg-error/10 p-3 text-sm text-error border border-error/20">{error}</div>}
        <Input 
          label="Email" 
          type="email" 
          placeholder="jane@company.com" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} />}
        />
        <Input 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
        />
        
        <Button type="submit" size="lg" className="mt-4 w-full" isLoading={isLoading}>
          Sign in
        </Button>
      </form>

      <div className="text-center text-sm text-text-secondary">
        <p>Don't have an account? <Link href="/register" className="font-medium text-accent-blue hover:text-blue-400 hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}
