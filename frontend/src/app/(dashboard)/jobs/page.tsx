'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Plus, MapPin, Users, ArrowRight, Activity, Briefcase, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useJobs, useCreateJob, useRankCandidates } from '@/features/jobs/queries';
import { Job } from '@/features/jobs/api';

export default function JobsPage() {
  const router = useRouter();
  const { data: jobs, isLoading } = useJobs();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs?.filter((job) => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">Active Requisitions</h1>
          <p className="mt-1 text-xs text-text-secondary">Open job requisitions and candidate ranking pipelines.</p>
        </div>
        <Button 
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 rounded-xl" 
          leftIcon={<Plus size={14} />} 
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Requisition
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
        <div className="w-full max-w-md">
          <Input 
            placeholder="Search jobs by title, department, or location..." 
            leftIcon={<Search size={16} className="text-text-muted" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 bg-white/5 border-white/10 text-xs text-white rounded-xl placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="bg-[#0e111a] border-white/10 rounded-2xl">
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-7 w-3/4 bg-white/10" />
                <Skeleton className="mb-6 h-4 w-1/2 bg-white/10" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                  <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-secondary text-xs font-mono">
            {searchQuery ? 'No jobs match your search filter.' : 'No active jobs found. Create one to get started.'}
          </div>
        ) : (
          filteredJobs.map((job, idx) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
            >
              <JobCard 
                job={job} 
                onViewMatches={() => router.push(`/jobs/${job.id}`)} 
              />
            </motion.div>
          ))
        )}
      </div>

      {isCreateModalOpen && <CreateJobModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
}

function JobCard({ job, onViewMatches }: { job: Job, onViewMatches: () => void }) {
  const { mutate: rankCandidates, isPending: isRanking } = useRankCandidates();
  const router = useRouter();

  const skills = job.skills || ['Python', 'FastAPI', 'SQL', 'AWS'];

  return (
    <Card className="flex h-full flex-col bg-[#0e111a]/90 backdrop-blur-2xl border-white/10 hover:border-indigo-500/40 hover:shadow-2xl transition-all duration-300 group cursor-pointer rounded-2xl overflow-hidden" onClick={onViewMatches}>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors text-base">{job.title}</h3>
            <p className="mt-1 text-xs font-mono text-text-secondary">{job.department || 'Engineering'}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {job.status || 'Active'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <MapPin size={13} className="text-indigo-400" />
            <span>{job.location || 'San Francisco, CA'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Users size={13} className="text-cyan-400" />
            <span>Full-Time</span>
          </div>
        </div>

        {/* Required Skills Badges */}
        <div className="mt-4 flex flex-wrap gap-1">
          {skills.slice(0, 4).map((skill: string) => (
            <span key={skill} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-text-muted">
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6 flex items-center gap-2.5">
          <Button 
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs shadow-md shadow-indigo-600/20"
            size="sm"
            isLoading={isRanking}
            leftIcon={!isRanking && <Zap size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              rankCandidates(job.id, {
                onSuccess: () => router.push(`/jobs/${job.id}`)
              });
            }}
          >
            {isRanking ? 'Ranking Candidates...' : 'Run Deterministic Match'}
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-text-secondary hover:text-white rounded-xl" rightIcon={<ArrowRight size={14} />} onClick={onViewMatches}>
            Matches
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateJobModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA (Hybrid)');
  const [description, setDescription] = useState('');
  const { mutate: createJob, isPending } = useCreateJob();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJob({ 
      title, 
      department, 
      location, 
      description, 
      status: 'Active' 
    }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <Card className="w-full max-w-lg border-white/10 bg-[#0e111a] shadow-2xl rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Briefcase size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Create New Job Requisition</h2>
              <p className="text-xs text-text-muted">Adds job to vector index for candidate deterministic scoring.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Job Title" required placeholder="e.g. Senior AI Infrastructure Engineer" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border-white/10 text-xs text-white" />
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="bg-white/5 border-white/10 text-xs text-white" />
              <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-white/5 border-white/10 text-xs text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">Job Description & Requirements</label>
              <textarea 
                className="flex h-32 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                required
                placeholder="Paste the job description, required skills, and qualification details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending} className="rounded-xl text-xs">Cancel</Button>
              <Button type="submit" size="sm" isLoading={isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs shadow-lg">Create Requisition</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
