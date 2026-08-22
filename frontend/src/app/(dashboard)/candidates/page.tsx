'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Filter, Download, Upload, ArrowRight, UserPlus, FileText, CheckCircle2 } from 'lucide-react';
import { useCandidates, useUploadResume } from '@/features/candidates/queries';
import { motion } from 'framer-motion';

export default function CandidatesPage() {
  const router = useRouter();
  const { data: candidates, isLoading, isError } = useCandidates();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredCandidates = candidates?.filter((candidate) => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.profile_jsonb?.role || candidate.role || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'ALL' || (candidate.status || 'New').toUpperCase() === selectedStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleExportCSV = () => {
    if (!candidates || candidates.length === 0) return;
    
    const headers = ['ID', 'Name', 'Email', 'Role', 'Experience', 'Status'];
    const rows = candidates.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.profile_jsonb?.role || c.role || 'Unspecified'}"`,
      `"${c.profile_jsonb?.experience_years ?? c.experience ?? 0}"`,
      `"${c.status || 'New'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `talentmind_candidates_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">Candidates Directory</h1>
          <p className="mt-1 text-xs text-text-secondary">Inspect, evaluate, and manage candidate talent profiles in your vector store.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-xl border-white/10 hover:bg-white/10 text-white" 
            leftIcon={<Download size={14} />} 
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button 
            size="sm" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 rounded-xl" 
            leftIcon={<UserPlus size={14} />} 
            onClick={() => setIsModalOpen(true)}
          >
            Upload Resume PDF
          </Button>
        </div>
      </div>

      {isModalOpen && <UploadResumeModal onClose={() => setIsModalOpen(false)} />}

      {/* Main Candidate Table Card */}
      <Card className="border-white/10 bg-[#0e111a]/90 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full max-w-md">
              <Input 
                placeholder="Search candidates by name, email, or skill..." 
                leftIcon={<Search size={16} className="text-text-muted" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 bg-white/5 border-white/10 text-xs text-white rounded-xl placeholder:text-text-muted"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                size="sm"
                leftIcon={<Filter size={14} />}
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-xl border-white/10 text-xs ${showFilters ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 font-bold' : 'text-text-secondary'}`}
              >
                Filters {selectedStatus !== 'ALL' && `(${selectedStatus})`}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-6 py-3 text-xs">
              <span className="text-text-muted uppercase tracking-widest font-mono text-[10px] font-bold">Filter by status:</span>
              {['ALL', 'NEW', 'ACTIVE', 'SHORTLISTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-full px-3 py-1 font-semibold transition-all text-xs ${
                    selectedStatus === status 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase tracking-wider text-text-muted py-4">Candidate Profile</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-text-muted">Target Role</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-text-muted">Experience</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-text-muted">Top Skills</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-text-muted">Status</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase tracking-wider text-text-muted">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="border-b border-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 bg-white/10" />
                          <Skeleton className="h-3 w-24 bg-white/10" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 rounded-xl bg-white/10 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-rose-400 font-medium">
                    Failed to load candidates. Please try refreshing.
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-text-secondary">
                    No candidate records found matching your query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => {
                  const role = candidate.profile_jsonb?.role || candidate.role || 'Senior Software Engineer';
                  const exp = (candidate.profile_jsonb?.experience_years ?? candidate.experience);
                  const skills = candidate.profile_jsonb?.skills || ['Python', 'FastAPI', 'SQL'];

                  return (
                    <TableRow 
                      key={candidate.id} 
                      className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
                      onClick={() => router.push(`/candidates/${candidate.id}`)}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 font-extrabold text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs group-hover:text-indigo-300 transition-colors">{candidate.name}</p>
                            <p className="text-[11px] font-mono text-text-muted mt-0.5">{candidate.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary font-medium">{role}</TableCell>
                      <TableCell className="text-xs text-text-secondary font-mono">{exp !== undefined ? `${exp} Years` : '3 Years'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {skills.slice(0, 3).map((s: string) => (
                            <span key={s} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-text-muted">
                              {s}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-indigo-300">
                          {candidate.status || 'Active'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl"
                          rightIcon={<ArrowRight size={14} />}
                          onClick={() => router.push(`/candidates/${candidate.id}`)}
                        >
                          Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function UploadResumeModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const { mutate: uploadResume, isPending, error } = useUploadResume();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    uploadResume(
      { 
        file, 
        name, 
        email, 
        onProgress: (p) => {
          if (p.total) {
            setProgress(Math.round((p.loaded * 100) / p.total));
          }
        }
      },
      {
        onSuccess: () => onClose()
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <Card className="w-full max-w-md border-white/10 bg-[#0e111a] shadow-2xl rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Upload Candidate Resume</h2>
              <p className="text-xs text-text-muted">Parses PDF and indexes vectors into FAISS.</p>
            </div>
          </div>

          {error && <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400 font-medium">Upload failed. Please verify PDF format.</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Candidate Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="bg-white/5 border-white/10 text-xs text-white" />
            <Input label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" className="bg-white/5 border-white/10 text-xs text-white" />
            
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-muted">Resume PDF File</label>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500 cursor-pointer"
                required
              />
            </div>
            
            {isPending && (
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-text-muted">
                  <span>Uploading PDF...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-2 rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending} className="rounded-xl text-xs">Cancel</Button>
              <Button type="submit" size="sm" isLoading={isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs shadow-lg">Upload Resume</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
