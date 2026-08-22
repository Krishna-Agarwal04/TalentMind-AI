'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Sparkles, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { authApi } from '@/features/auth/api';
import { getApiBaseUrl } from '@/lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('recruiter@talentmind.ai');
  const [password, setPassword] = useState('password123');

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login({ email: loginEmail, password: loginPass });
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handleDemoLogin = () => {
    setEmail('recruiter@talentmind.ai');
    setPassword('password123');
    executeLogin('recruiter@talentmind.ai', 'password123');
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center md:text-left">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">Welcome back</h1>
        <p className="mt-2 text-xs text-text-secondary">Enter your credentials to access the TalentMind AI Recruiter Dashboard.</p>
      </div>

      {/* Instant 1-Click Demo Login Box */}
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
            <Sparkles size={15} /> Instant Demo Access
          </div>
          <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-bold">1-Click Login</span>
        </div>
        <div className="mt-3 space-y-1.5 font-mono text-xs text-text-secondary bg-black/30 p-3 rounded-xl border border-white/5">
          <p className="flex justify-between"><span className="text-text-muted">Email:</span> <span className="font-semibold text-white">recruiter@talentmind.ai</span></p>
          <p className="flex justify-between"><span className="text-text-muted">Password:</span> <span className="font-semibold text-white">password123</span></p>
        </div>
        <Button
          type="button"
          size="md"
          isLoading={isLoading}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
          leftIcon={<KeyRound size={16} />}
          onClick={handleDemoLogin}
        >
          Instant Demo Sign In
        </Button>
      </div>

      <form className="flex flex-col space-y-4" onSubmit={handleLoginSubmit}>
        {error && <div className="rounded-xl bg-rose-500/10 p-3.5 text-xs text-rose-400 border border-rose-500/20 font-medium">{error}</div>}
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="recruiter@talentmind.ai" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} className="text-text-muted" />}
          className="bg-white/5 border-white/10 text-xs text-white"
        />
        <Input 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} className="text-text-muted" />}
          className="bg-white/5 border-white/10 text-xs text-white"
        />
        
        <Button type="submit" size="lg" className="mt-4 w-full rounded-xl bg-white text-black hover:bg-slate-200 font-bold" isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
          Sign in
        </Button>
      </form>

      <div className="text-center text-xs text-text-secondary">
        <p>Don't have an account? <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}
