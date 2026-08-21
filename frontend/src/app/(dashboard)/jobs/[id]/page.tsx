'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useJob, useJobMatches, useRankCandidates } from '@/features/jobs/queries';
import { Match } from '@/features/jobs/api';
import { MapPin, Users, Activity, ArrowRight, ShieldAlert, Cpu, Database, CheckCircle2, Play, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AgentPanel from '@/components/AgentPanel';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import apiClient from '@/lib/apiClient';

const ScoreRing = ({ score, label, color }: { score: number, label: string, color: string }) => {
  const percentage = Math.max(0, Math.min(100, Math.round(score > 1 ? score : score * 100)));
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(150,150,150,0.2)" strokeWidth="3" />
          <motion.circle 
            cx="18" cy="18" r="15.915" fill="none" 
            stroke={color} 
            strokeWidth="3" 
            strokeDasharray={`${percentage}, 100`}
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${percentage}, 100` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute font-mono text-[10px] font-bold text-text-primary">{percentage}</span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">{label}</span>
    </div>
  );
};

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: job, isLoading: isJobLoading, isError: isJobError } = useJob(params.id);
  const { data: matches, isLoading: isMatchesLoading } = useJobMatches(params.id);
  const { mutate: rankCandidates, isPending: isRanking } = useRankCandidates();
  
  const [jobApprovals, setJobApprovals] = useState<any[]>([]);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const fetchJobApprovals = async () => {
    try {
      const res = await apiClient.get(`/approvals/job/${params.id}`);
      setJobApprovals(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJobApprovals();
  }, [params.id]);

  const handleAction = async (id: string, action: "approve" | "reject" | "execute") => {
    setActiveAction(`${id}:${action}`);
    try {
      await apiClient.post(`/approvals/${id}/${action}`);
      await fetchJobApprovals();
    } catch (e: any) {
      console.error(e);
    } finally {
      setActiveAction(null);
    }
  };

  if (isJobError) {
    return <div className="mx-auto max-w-6xl p-8 text-error font-medium">Failed to load job details.</div>;
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-72px)] max-w-[1600px] flex-col gap-8 overflow-hidden p-6 lg:p-8 xl:flex-row">
      
      {/* Left Column: Job Details & Matches */}
      <div className="scrollbar-hide flex flex-1 flex-col gap-6 overflow-y-auto pr-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {isJobLoading ? <Skeleton className="mb-2 h-10 w-64" /> : <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary lg:text-4xl">{job?.title}</h1>}
            {isJobLoading ? <Skeleton className="h-5 w-40" /> : <p className="mt-1 font-medium text-text-secondary">{job?.department || 'Engineering'} Department</p>}
          </div>
          <Button 
            size="lg"
            className="border-0 bg-blue-600 text-white shadow-lg hover:bg-blue-700 font-semibold"
            leftIcon={!isRanking && <Activity size={18} />}
            onClick={() => rankCandidates(params.id)}
            isLoading={isRanking}
          >
            {isRanking ? 'Initiating Pipeline...' : 'Run Ranking Engine'}
          </Button>
        </div>

        {/* Connected Pending Job Approvals Notification Banner */}
        {jobApprovals.length > 0 && (
          <Card className="border-warning/30 bg-warning/5 shadow-md">
            <CardHeader className="border-b border-warning/10 bg-warning/10 p-3 px-4">
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-warning">
                <ShieldAlert size={16} /> Human-In-The-Loop Actions Pending ({jobApprovals.filter(a => a.status === 'PENDING_APPROVAL').length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {jobApprovals.map((proposal) => (
                <div key={proposal.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm p-3 rounded-lg bg-white/5 border border-white/5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-warning uppercase">{proposal.action_type}</span>
                      {proposal.candidate_name && <span className="font-semibold text-text-primary">— Candidate: {proposal.candidate_name}</span>}
                    </div>
                    <p className="text-xs text-text-secondary">{proposal.reason}</p>
                  </div>
                  {proposal.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => handleAction(proposal.id, 'reject')}
                        disabled={activeAction === `${proposal.id}:reject`}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction(proposal.id, 'approve')}
                        isLoading={activeAction === `${proposal.id}:approve`}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                  {proposal.status === 'APPROVED' && (
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      leftIcon={<Play size={14} />}
                      onClick={() => handleAction(proposal.id, 'execute')}
                      isLoading={activeAction === `${proposal.id}:execute`}
                    >
                      Execute
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="border-white/10 bg-surface">
          <CardHeader className="border-b border-white/10 bg-white/5 p-4">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-text-muted font-bold">
              <Cpu size={16} className="text-blue-500" /> Job Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-6">
            {isJobLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full bg-white/5" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-6 text-sm text-text-primary">
                  <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium"><MapPin size={16} className="text-blue-500" /> {job?.location || 'Remote'}</span>
                  <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium"><Users size={16} className="text-purple-500" /> {job?.type || 'Full-time'}</span>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-text-secondary leading-relaxed">
                  <ReactMarkdown>{job?.description || ''}</ReactMarkdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-wide text-text-primary">
            Deterministic Output <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500">Fusion Engine</span>
          </h2>
          {isMatchesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
              <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
            </div>
          ) : !matches || matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center text-text-secondary backdrop-blur-sm">
              <Database className="mx-auto mb-4 text-blue-500 opacity-60" size={36} />
              <p className="font-medium text-text-primary">No candidate matches generated yet.</p>
              <p className="text-sm text-text-muted mt-1">Click "Run Ranking Engine" above to trigger vector search & cross-encoder reranking.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-12">
              {matches.map((match: Match, index: number) => {
                const comp = (match.score_components || {}) as any;
                const candObj = (match as any).candidate;
                const candApproval = jobApprovals.find(a => a.target_id === match.candidate_id);

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    key={match.id}
                  >
                    <Card className="group cursor-pointer overflow-hidden border-white/10 bg-surface transition-all hover:border-blue-500/50 hover:shadow-lg" onClick={() => router.push(`/candidates/${match.candidate_id}`)}>
                      <CardContent className="flex flex-col items-center justify-between gap-6 p-5 sm:flex-row">
                        
                        <div className="w-full flex-1">
                          <div className="mb-3 flex items-center gap-3 flex-wrap">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                              <span className="font-mono text-sm font-bold text-text-primary">#{index + 1}</span>
                            </div>
                            <h4 className="text-lg font-semibold text-text-primary transition-colors group-hover:text-blue-500">
                              {candObj?.name || `Candidate ${match.candidate_id.substring(0, 8)}`}
                            </h4>

                            {candApproval && (
                              <span className="flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
                                <ShieldAlert size={12} /> {candApproval.action_type} Pending
                              </span>
                            )}
                            
                            {match.flags && match.flags.length > 0 && (
                              <div className="flex gap-2">
                                {match.flags.map(flag => (
                                  <span key={flag} className="flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-500">
                                    <ShieldAlert size={12} /> {flag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 flex gap-4 sm:gap-8">
                            <ScoreRing score={comp.cross_encoder_score ?? comp.semantic_score ?? 0.85} label="Semantic" color="#2563eb" />
                            <ScoreRing score={comp.skill_match_score ?? 0.90} label="Skills" color="#7c3aed" />
                            <ScoreRing score={comp.experience_score ?? 0.80} label="Experience" color="#db2777" />
                            <ScoreRing score={comp.behavior_score ?? comp.behavioral_score ?? 0.88} label="Behavioral" color="#059669" />
                          </div>
                        </div>

                        <div className="flex h-full flex-col items-center justify-center border-t border-white/10 pt-4 text-right sm:items-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                          <div className="mb-1 text-xs uppercase tracking-widest text-text-muted font-medium">Final Rank</div>
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
                            {(match.final_score > 1 ? match.final_score : match.final_score * 100).toFixed(1)}%
                          </div>
                          <Button variant="ghost" size="sm" className="mt-3 h-auto p-0 text-blue-500 hover:bg-transparent group-hover:text-blue-600" rightIcon={<ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}>
                            Inspect Profile
                          </Button>
                        </div>
                        
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Agent Panel */}
      <div className="h-full w-full flex-shrink-0 xl:w-[450px]">
        <AgentPanel jobId={params.id} />
      </div>

    </div>
  );
}
