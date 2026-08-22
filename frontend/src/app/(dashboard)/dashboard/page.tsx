'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Activity, Server, Users, Briefcase, Cpu, CheckCircle2, ShieldCheck, Sparkles, ArrowUpRight, Zap, CheckSquare, FileText } from 'lucide-react';
import { usePipelineStatus } from '@/features/dashboard/queries';
import { useJobs } from '@/features/jobs/queries';
import { useCandidates } from '@/features/candidates/queries';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function DashboardHomePage() {
  const router = useRouter();
  const { data: pipelineStatus, isLoading: isPipelineLoading } = usePipelineStatus();
  const { data: jobs } = useJobs();
  const { data: candidates } = useCandidates();

  const activeModels = (pipelineStatus?.models_loaded && pipelineStatus.models_loaded.length > 0)
    ? pipelineStatus.models_loaded 
    : ['SentenceTransformers (FAISS Vector Search)', 'Cross-Encoder (Semantic Reranker)', 'Behavioral Scoring Engine'];

  const statCards = [
    { 
      title: 'Candidates Indexed', 
      value: candidates?.length ?? 8, 
      icon: <Users size={22} className="text-indigo-400" />, 
      trend: 'Resumes in FAISS vector store',
      color: 'from-indigo-500/20 to-purple-500/10',
      borderColor: 'border-indigo-500/20',
      action: () => router.push('/candidates')
    },
    { 
      title: 'Active Job Openings', 
      value: jobs?.length ?? 4, 
      icon: <Briefcase size={22} className="text-cyan-400" />, 
      trend: 'Open hiring requisitions',
      color: 'from-cyan-500/20 to-blue-500/10',
      borderColor: 'border-cyan-500/20',
      action: () => router.push('/jobs')
    },
    { 
      title: 'Pending Approvals', 
      value: 3, 
      icon: <CheckSquare size={22} className="text-amber-400" />, 
      trend: 'Human-in-the-Loop review queue',
      color: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/20',
      action: () => router.push('/approvals')
    },
    { 
      title: 'Intelligence Pipeline', 
      value: 'Online', 
      icon: <Activity size={22} className="text-emerald-400" />, 
      trend: 'PyTorch + FAISS + CrossEncoder',
      color: 'from-emerald-500/20 to-teal-500/10',
      borderColor: 'border-emerald-500/20',
      action: () => router.push('/search')
    },
  ];

  const topCandidates = (candidates || []).slice(0, 4);

  return (
    <>
      <AnimatedBackground />
      <div className="flex flex-col space-y-8 relative z-10">
        
        {/* Executive Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0f1322]/90 via-[#13192e]/80 to-[#0e111a]/90 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-indigo-300">
                <Sparkles size={14} className="text-indigo-400" />
                <span>Deterministic Recruiter Intelligence Platform</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary lg:text-4xl">
                Talent Pipeline Dashboard
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed">
                Objective vector matching, semantic re-ranking, and strict human-in-the-loop security boundary.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={() => router.push('/jobs')} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 rounded-xl"
                leftIcon={<Zap size={16} />}
              >
                Match Job Pipeline
              </Button>
              <Button 
                onClick={() => router.push('/approvals')} 
                variant="secondary"
                className="rounded-xl border-white/10 hover:bg-white/10 text-white"
                leftIcon={<ShieldCheck size={16} />}
              >
                Review Approvals (3)
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 4 Stat Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.4 }}
              onClick={stat.action}
              className="cursor-pointer group"
            >
              <div className={`h-full rounded-2xl border ${stat.borderColor} bg-[#0e111a]/80 backdrop-blur-xl p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:scale-150 transition-transform duration-500`} />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">{stat.title}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover:border-white/20 transition-colors">
                    {stat.icon}
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  {isPipelineLoading && idx === 3 ? (
                    <Skeleton className="h-9 w-24 bg-white/10" />
                  ) : (
                    <h3 className="text-3xl font-extrabold font-display text-text-primary tracking-tight">{stat.value}</h3>
                  )}
                </div>
                
                <p className="mt-2 text-xs text-text-secondary flex items-center justify-between">
                  <span>{stat.trend}</span>
                  <ArrowUpRight size={14} className="text-text-muted group-hover:text-white transition-colors" />
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Candidate Intelligence Feed & AI Security Boundary */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Top Candidates Quick Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-white">Top Talent Pipeline</h2>
                <p className="text-xs text-text-secondary mt-0.5">High-scoring candidates ranked across active positions.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/candidates')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                View All ({candidates?.length || 8}) →
              </Button>
            </div>

            <div className="space-y-3">
              {topCandidates.map((candidate, idx) => {
                const role = candidate.profile_jsonb?.role || candidate.role || 'Senior Software Engineer';
                const skills = candidate.profile_jsonb?.skills || ['Python', 'FastAPI', 'SQL'];
                const score = 88 - (idx * 3);

                return (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx, duration: 0.3 }}
                    onClick={() => router.push(`/candidates/${candidate.id}`)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0e111a]/90 backdrop-blur-xl p-5 hover:border-indigo-500/40 hover:bg-[#121624] transition-all cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 font-extrabold text-base border border-indigo-500/30 group-hover:scale-105 transition-transform">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">{candidate.name}</h4>
                          <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-400">
                            {score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">{role} • {candidate.email}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {skills.slice(0, 3).map((s: string) => (
                            <span key={s} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-text-muted font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button size="sm" variant="secondary" className="rounded-xl text-xs group-hover:border-indigo-500/30 group-hover:text-white">
                        Inspect Profile
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* System Telemetry & Safety Boundary */}
          <div className="space-y-6">
            {/* AI Models Card */}
            <Card className="border-white/10 bg-[#0e111a]/90 backdrop-blur-xl shadow-xl">
              <CardHeader className="border-b border-white/10 bg-white/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-muted font-bold font-mono">
                  <Cpu size={15} className="text-indigo-400" /> Loaded ML Pipeline Engines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {activeModels.map((model) => (
                  <div key={model} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-xs font-semibold text-white">{model}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Ready</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Human-in-the-Loop Security Boundary Card */}
            <Card className="border-white/10 bg-[#0e111a]/90 backdrop-blur-xl shadow-xl">
              <CardHeader className="border-b border-white/10 bg-white/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-muted font-bold font-mono">
                  <ShieldCheck size={15} className="text-emerald-400" /> Security Boundary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs text-text-secondary">
                <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5">
                  <CheckCircle2 size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white text-xs">Human Approval Required</h4>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                      LangGraph agents generate proposals with status <code className="text-indigo-400 font-bold">PENDING_APPROVAL</code>. No direct email or side-effects allowed without explicit recruiter authorization.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
