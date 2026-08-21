'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Filter, Download, Upload, ArrowRight } from 'lucide-react';
import { useCandidates, useUploadResume } from '@/features/candidates/queries';

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">Candidates</h1>
          <p className="mt-1 text-text-secondary">Manage and evaluate your talent pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Download size={16} />} onClick={handleExportCSV}>Export CSV</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg" leftIcon={<Upload size={16} />} onClick={() => setIsModalOpen(true)}>Add Candidate</Button>
        </div>
      </div>

      {isModalOpen && <UploadResumeModal onClose={() => setIsModalOpen(false)} />}

      <Card className="border-white/10 bg-surface shadow-xl">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full max-w-md">
              <Input 
                placeholder="Search by name, email, or role..." 
                leftIcon={<Search size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                leftIcon={<Filter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold' : ''}
              >
                Filters {selectedStatus !== 'ALL' && `(${selectedStatus})`}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-6 py-3 text-xs">
              <span className="text-text-muted uppercase tracking-wider font-bold">Filter by status:</span>
              {['ALL', 'NEW', 'ACTIVE', 'SHORTLISTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                    selectedStatus === status 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-error font-medium">
                    Failed to load candidates. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-text-secondary">
                    No candidates match your search filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow 
                    key={candidate.id} 
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => router.push(`/candidates/${candidate.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 font-bold text-blue-500 ring-1 ring-blue-500/20">
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{candidate.name}</p>
                          <p className="text-xs text-text-muted">{candidate.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">{candidate.profile_jsonb?.role || candidate.role || 'Unspecified'}</TableCell>
                    <TableCell className="text-text-secondary">{(candidate.profile_jsonb?.experience_years ?? candidate.experience) !== undefined ? `${candidate.profile_jsonb?.experience_years ?? candidate.experience} years` : 'N/A'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500">
                        {candidate.status || 'New'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-500 hover:text-blue-600 hover:bg-transparent"
                        rightIcon={<ArrowRight size={14} />}
                        onClick={() => router.push(`/candidates/${candidate.id}`)}
                      >
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md border-white/10 bg-surface shadow-2xl">
        <CardContent className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-text-primary">Upload Candidate Resume</h2>
          {error && <div className="mb-4 text-sm text-error font-medium">Upload failed</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">Resume (PDF)</label>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="w-full rounded-md border border-white/10 bg-white/5 p-2 text-sm text-text-primary file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                required
              />
            </div>
            
            {isPending && (
              <div className="mt-4 h-2.5 w-full rounded-full bg-white/10">
                <div className="h-2.5 rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" isLoading={isPending} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Upload</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
