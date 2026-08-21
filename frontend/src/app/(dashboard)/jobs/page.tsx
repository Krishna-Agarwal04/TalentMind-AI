'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Plus, MapPin, Users, ArrowRight, Activity } from 'lucide-react';
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">Active Jobs</h1>
          <p className="mt-1 text-text-secondary">Manage your open requisitions and candidate ranking pipelines.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg" leftIcon={<Plus size={16} />} onClick={() => setIsCreateModalOpen(true)}>Create Job</Button>
      </div>

      <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
        <div className="w-full max-w-md">
          <Input 
            placeholder="Search jobs by title, department, or location..." 
            leftIcon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-7 w-3/4" />
                <Skeleton className="mb-6 h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-secondary">
            {searchQuery ? 'No jobs match your search query.' : 'No jobs found. Create one to get started.'}
          </div>
        ) : (
          filteredJobs.map((job, idx) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
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

  return (
    <Card className="flex h-full flex-col bg-surface border-white/10 transition-all hover:border-blue-500/40 hover:shadow-lg group cursor-pointer" onClick={onViewMatches}>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-text-primary group-hover:text-blue-500 transition-colors text-lg">{job.title}</h3>
            <p className="mt-1 text-sm font-medium text-text-secondary">{job.department || 'Engineering'}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500 border border-green-500/20">
            {job.status || 'Active'}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin size={14} className="text-blue-500" />
            <span>{job.location || 'Remote'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Users size={14} className="text-purple-500" />
            <span>Full-time</span>
          </div>
        </div>

        <div className="mt-auto pt-6 flex items-center gap-3">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
            isLoading={isRanking}
            leftIcon={!isRanking && <Activity size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              rankCandidates(job.id, {
                onSuccess: () => router.push(`/jobs/${job.id}`)
              });
            }}
          >
            {isRanking ? 'Ranking...' : 'Rank Candidates'}
          </Button>
          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-transparent" rightIcon={<ArrowRight size={14} />} onClick={onViewMatches}>
            View
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-white/10 bg-surface shadow-2xl">
        <CardContent className="p-6">
          <h2 className="mb-6 font-display text-xl font-bold text-text-primary">Create New Job Requisition</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Job Title" required placeholder="e.g. Senior Backend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} />
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-text-primary">Job Description & Requirements</label>
              <textarea 
                className="flex h-32 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                required
                placeholder="Paste the job description, required skills, and qualification details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" isLoading={isPending} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Create Job</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
