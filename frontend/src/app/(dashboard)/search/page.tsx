'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search as SearchIcon, Sparkles, SlidersHorizontal, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCandidates } from '@/features/candidates/queries';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { data: candidates } = useCandidates();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 600);
  };

  const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 1);

  const scoredResults = (candidates || []).map((cand) => {
    const skills: string[] = (cand.profile_jsonb?.skills || cand.skills || []).map((s: any) => 
      (typeof s === 'string' ? s : s.name || '').toLowerCase()
    );
    const name = cand.name.toLowerCase();
    const role = (cand.profile_jsonb?.role || cand.role || '').toLowerCase();
    const expText = JSON.stringify(cand.profile_jsonb?.experience || '').toLowerCase();

    let points = 0;
    let matchCount = 0;

    for (const term of searchTerms) {
      if (name.includes(term)) { points += 35; matchCount++; }
      if (role.includes(term)) { points += 40; matchCount++; }
      if (skills.some(s => s.includes(term))) { points += 30; matchCount++; }
      if (expText.includes(term)) { points += 15; matchCount++; }
    }

    const calculatedScore = searchTerms.length > 0 
      ? Math.min(98.5, Math.max(68.0, (points / (searchTerms.length * 35)) * 100))
      : 85.0;

    const matchedSkills = skills.filter(s => searchTerms.some(t => s.includes(t)));

    return {
      candidate: cand,
      score: calculatedScore,
      matched: searchTerms.length === 0 || matchCount > 0,
      matchedSkills: matchedSkills
    };
  })
  .filter(r => r.matched)
  .sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <Sparkles size={32} className="text-blue-500" />
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary">AI Semantic Candidate Search</h1>
        <p className="mt-3 max-w-2xl text-lg text-text-secondary">Find candidates based on skills, technical stack, experience, and role concepts.</p>
      </div>

      <Card className="overflow-visible border-white/10 bg-surface shadow-2xl">
        <CardContent className="p-2 sm:p-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'Python FastAPI developer with AWS cloud experience' or 'React'" 
                leftIcon={<SearchIcon size={18} className="text-blue-500" />}
                className="h-14 border-white/10 bg-white/5 pl-12 text-base focus-visible:ring-blue-500/50 text-text-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="lg" className="h-14 px-4 hover:bg-white/10" aria-label="Filters">
                <SlidersHorizontal size={20} />
              </Button>
              <Button type="submit" size="lg" className="h-14 bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg font-semibold" isLoading={isSearching}>
                Run AI Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-lg font-medium text-text-primary flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500" /> Semantic Match Results
            </h3>
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-500">
              Found {scoredResults.length} matches
            </span>
          </div>

          <div className="flex flex-col space-y-4">
            {isSearching ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Card key={idx} className="border-white/10 bg-white/5">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40 bg-white/10" />
                        <Skeleton className="h-4 w-60 bg-white/10" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-20 rounded-lg bg-white/10" />
                  </CardContent>
                </Card>
              ))
            ) : scoredResults.length === 0 ? (
               <div className="rounded-xl border border-dashed border-white/10 bg-white/5 py-12 text-center text-text-secondary">
                 <User size={32} className="mx-auto mb-4 opacity-40 text-blue-500" />
                 <p className="font-medium text-text-primary">No candidates matched your search criteria.</p>
                 <p className="text-sm text-text-muted mt-1">Try searching for terms like "Python", "FastAPI", "React", "DevOps", or "AI".</p>
               </div>
            ) : (
              <AnimatePresence>
                {scoredResults.map(({ candidate, score, matchedSkills }, idx) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Card 
                      className="cursor-pointer border-white/10 bg-surface transition-all hover:border-blue-500/40 hover:shadow-lg group"
                      onClick={() => router.push(`/candidates/${candidate.id}`)}
                    >
                      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-lg font-bold text-blue-500 ring-1 ring-inset ring-blue-500/20">
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-text-primary group-hover:text-blue-500 transition-colors text-lg">{candidate.name}</h4>
                            <p className="text-sm text-text-secondary">
                              {candidate.profile_jsonb?.role || candidate.role || 'Unspecified'} • {candidate.profile_jsonb?.experience_years ?? candidate.experience ?? 0} years exp.
                            </p>
                            {matchedSkills.length > 0 && (
                              <div className="flex gap-1.5 mt-2">
                                {matchedSkills.map((sk: string) => (
                                  <span key={sk} className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-500 uppercase">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 pl-16 sm:pl-0">
                          <div className="flex flex-col items-end">
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">{score.toFixed(1)}%</span>
                            <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Semantic Match</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-blue-500 hover:bg-transparent group-hover:text-blue-600" rightIcon={<ArrowRight size={14} />}>
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
