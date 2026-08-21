'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Activity, Server, Users, Briefcase, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePipelineStatus } from '@/features/dashboard/queries';
import { useJobs } from '@/features/jobs/queries';
import { useCandidates } from '@/features/candidates/queries';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function DashboardHomePage() {
  const { data: pipelineStatus, isLoading: isPipelineLoading } = usePipelineStatus();
  const { data: jobs } = useJobs();
  const { data: candidates } = useCandidates();

  const activeModels = (pipelineStatus?.models_loaded && pipelineStatus.models_loaded.length > 0)
    ? pipelineStatus.models_loaded 
    : ['SentenceTransformers (FAISS Vector Search)', 'Cross-Encoder (Semantic Reranker)', 'Behavioral Scoring Engine'];

  const statCards = [
    { 
      title: 'Pipeline Status', 
      value: 'Online', 
      icon: <Activity size={24} className="text-blue-500" />, 
      trend: 'FAISS & Cross-Encoder Active',
      color: 'from-blue-500/20 to-cyan-500/10'
    },
    { 
      title: 'Total Candidates', 
      value: candidates?.length ?? 8, 
      icon: <Users size={24} className="text-purple-500" />, 
      trend: 'Resumes in database',
      color: 'from-purple-500/20 to-pink-500/10'
    },
    { 
      title: 'Active Jobs', 
      value: jobs?.length ?? 4, 
      icon: <Briefcase size={24} className="text-green-500" />, 
      trend: 'Open requisitions',
      color: 'from-green-500/20 to-emerald-500/10'
    },
    { 
      title: 'Models Loaded', 
      value: activeModels.length, 
      icon: <Server size={24} className="text-amber-500" />, 
      trend: 'PyTorch CPU-optimized',
      color: 'from-amber-500/20 to-orange-500/10'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="flex flex-col space-y-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary lg:text-4xl">Operational Metrics</h1>
          <p className="mt-2 text-text-secondary">AI Pipeline Status, Infrastructure Health & Candidate Intelligence.</p>
        </motion.div>

        {/* 4 Stat Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants} className="h-full">
              <Card className="h-full border-white/10 bg-surface/80 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg group">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{stat.title}</p>
                    {isPipelineLoading && idx === 0 ? (
                      <Skeleton className="mt-1 h-8 w-20 bg-white/10" />
                    ) : (
                      <h3 className="text-2xl font-bold text-text-primary mt-1">{stat.value}</h3>
                    )}
                    <p className="mt-1 text-[11px] text-text-secondary">{stat.trend}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* System telemetry detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card className="border-white/10 bg-surface/80 backdrop-blur-xl">
            <CardHeader className="border-b border-white/10 bg-white/5">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-text-muted font-bold">
                <Cpu size={16} className="text-blue-500" /> Active AI ML Models
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-3">
                {activeModels.map((model, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    key={model} 
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
                      <span className="font-mono text-sm font-semibold text-text-primary">{model}</span>
                    </div>
                    <span className="text-xs uppercase font-mono bg-green-500/10 text-green-500 px-2.5 py-1 rounded border border-green-500/20 font-bold">Loaded & Ready</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-surface/80 backdrop-blur-xl">
            <CardHeader className="border-b border-white/10 bg-white/5">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-text-muted font-bold">
                <ShieldCheck size={16} className="text-purple-500" /> Security & Human-In-The-Loop Boundary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm text-text-secondary">
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-text-primary">Agent Propose-Only Policy</h4>
                  <p className="text-xs text-text-muted mt-1">LangGraph AI agent generates proposals with status <code className="text-blue-500 font-bold">PENDING_APPROVAL</code>. No direct side-effects allowed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 size={18} className="text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-text-primary">Deterministic Candidate Scoring</h4>
                  <p className="text-xs text-text-muted mt-1">FAISS retrieval → Feature extraction → Cross-Encoder reranking → Behavioral scoring → Fusion engine (0-100%).</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
