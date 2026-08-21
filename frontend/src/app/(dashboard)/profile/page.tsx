'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Briefcase, Phone, Camera, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [name, setName] = useState('Jane Doe');
  const [role, setRole] = useState('Senior Technical Recruiter');
  const [email, setEmail] = useState('jane@talentmind.ai');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [avatarSeed, setAvatarSeed] = useState('Admin');

  useEffect(() => {
    if (user) {
      setName(user.name || user.email.split('@')[0].toUpperCase());
      setEmail(user.email || 'recruiter@talentmind.ai');
      setRole(user.role || 'Senior Technical Recruiter');
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      if (user) {
        const updatedUser = { ...user, name, email, role };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setTimeout(() => setIsSaved(false), 3000);
    }, 600);
  };

  const handleChangeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">My Profile</h1>
        <p className="mt-2 text-text-secondary">Update your recruiter profile, contact details, and account preferences.</p>
      </div>

      {isSaved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-500 font-medium">
          <CheckCircle2 size={18} /> Profile updated successfully!
        </motion.div>
      )}

      <Card className="border-white/10 bg-surface shadow-2xl">
        <CardHeader className="border-b border-white/10 bg-white/5">
          <CardTitle className="text-text-primary">Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-xl">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="Profile Avatar" className="h-full w-full rounded-full object-cover bg-black/40" />
              </div>
              <button 
                onClick={handleChangeAvatar} 
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-surface shadow-lg transition-transform hover:scale-110"
                title="Change Avatar"
              >
                <Camera size={14} className="text-text-secondary hover:text-text-primary" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <Button variant="secondary" size="sm" onClick={handleChangeAvatar}>Change Avatar</Button>
              <Button variant="ghost" size="sm" className="text-error hover:bg-error/10 hover:text-red-500" onClick={() => setAvatarSeed('Admin')}>Reset Avatar</Button>
            </div>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input 
                label="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={16} />}
                required
              />
              <Input 
                label="Role Title" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                leftIcon={<Briefcase size={16} />}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input 
                label="Email Address" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
              />
              <Input 
                label="Phone Number" 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone size={16} />}
              />
            </div>
            
            <div className="flex justify-end pt-4 border-t border-white/10">
              <Button type="submit" isLoading={isSaving} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
