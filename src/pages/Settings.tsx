import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/DevCoreAuthContext';
import { authService } from '../lib/authService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, User, CheckCircle2, AlertCircle, Loader2, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [isLightMode, setIsLightMode] = useState(() => document.body.classList.contains('light'));

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    if (newMode) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    setIsBusy(true);
    setStatus(null);

    try {
      await authService.updatePassword(newPassword);
      setStatus({ type: 'success', message: 'Password updated successfully across the mesh.' });
      setNewPassword('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Handshake failed during password update.' });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep text-text-main flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="h-[64px] border-b border-border-dim flex items-center justify-between px-8 bg-bg-side/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/chat')}
            className="p-2 text-text-dim hover:text-text-main hover:bg-bg-card rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[16px] font-bold tracking-tight">System Settings</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-text-dim hover:text-text-main hover:bg-bg-card rounded-lg transition-all"
            title="Toggle Theme"
          >
            {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button 
            onClick={logout}
            className="px-4 py-2 border border-red-500/20 text-red-500 bg-red-500/5 rounded-lg hover:bg-red-500/10 transition-all text-[11px] font-mono uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
        {/* User Card */}
        <section className="bg-bg-side border border-border-dim p-8 rounded-2xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded bg-accent/10 border border-accent/20 flex items-center justify-center">
                 <User className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{user?.display_name}</h2>
                <p className="text-text-dim font-mono text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Identity', value: user?.display_name || 'Yusef' },
                 { label: 'Team', value: (user?.team || 'DevCore') },
                 { label: 'API Identity', value: 'Authorized Node' },
                 { label: 'Status', value: 'Encrypted Session' }
               ].map((stat, idx) => (
                 <div key={idx} className="bg-bg-deep p-4 rounded border border-border-dim">
                    <p className="text-[10px] font-mono text-text-dim uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-sm font-medium text-text-main truncate font-mono">{stat.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Security Update */}
        <section className="space-y-6">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-bg-side border border-border-dim rounded flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
             </div>
             <div>
                <h3 className="text-lg font-bold">Change Password</h3>
                <p className="text-xs text-text-dim font-mono uppercase tracking-widest">Update Your Mesh Access Token</p>
             </div>
           </div>

           <div className="bg-bg-side border border-border-dim p-8 rounded-2xl">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                 <AnimatePresence mode="wait">
                   {status && (
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "p-4 rounded-lg border flex items-start gap-3",
                          status.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-200/80" : "bg-red-500/10 border-red-500/20 text-red-200/80"
                        )}
                     >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <p className="text-xs font-mono italic leading-relaxed">{status.message}</p>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="space-y-3">
                    <label className="text-[11px] font-mono text-text-dim uppercase tracking-widest px-1">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-dim group-focus-within:text-accent transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new mesh password"
                        className="w-full bg-bg-deep border border-border-dim rounded-lg py-3.5 pl-12 pr-4 text-text-main placeholder:text-text-dim/50 focus:outline-none focus:border-accent/40 transition-all font-mono text-sm"
                      />
                    </div>
                 </div>

                 <button
                    type="submit"
                    disabled={isBusy || !newPassword.trim()}
                    className="w-full bg-accent text-bg-deep font-bold py-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {isBusy ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-mono text-[11px] uppercase tracking-tighter">Syncing Credentials...</span>
                      </>
                    ) : (
                      <span className="uppercase tracking-widest text-xs font-bold font-mono">Confirm Password Change</span>
                    )}
                 </button>
              </form>
           </div>
        </section>

        <section className="pt-12 border-t border-border-dim text-center">
            <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest transition-colors duration-200">Geometric Control Layer v1.0.1</p>
        </section>
      </main>
    </div>
  );
};
