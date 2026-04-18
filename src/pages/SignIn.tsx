import React, { useState } from 'react';
import { useAuth } from '../lib/DevCoreAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Terminal, Lock, Mail, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/chat';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Access denied.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Visual background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#38BDF808_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(45,49,57,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(45,49,57,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-bg-card border border-border-dim rounded-lg mb-6 shadow-xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-6 h-6 bg-accent rounded-sm" />
          </div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight mb-2">DevCore</h1>
          <p className="text-text-dim font-mono text-[10px] uppercase tracking-[0.2em]">Geometric Mesh Network Access</p>
        </div>

        <div className="bg-bg-side border border-border-dim p-8 rounded-2xl shadow-2xl">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200/80 leading-relaxed font-mono">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-text-dim uppercase tracking-widest px-1">Infrastructure ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-dim group-focus-within:text-accent transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-bg-deep border border-border-dim rounded-lg py-3 pl-12 pr-4 text-text-main placeholder:text-zinc-800 focus:outline-none focus:border-accent/40 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-text-dim uppercase tracking-widest px-1">Access Token</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-dim group-focus-within:text-accent transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bg-deep border border-border-dim rounded-lg py-3 pl-12 pr-4 text-text-main placeholder:text-zinc-800 focus:outline-none focus:border-accent/40 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="w-full bg-accent text-bg-deep font-bold py-3.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 shadow-lg shadow-accent/10"
            >
              <AnimatePresence mode="wait">
                {isBusy ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-mono text-[11px] uppercase tracking-tighter">Validating...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <span className="uppercase tracking-widest text-xs font-bold">Request Authorized Access</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest">
            Geometric Control Layer v1.0.1
          </p>
        </div>
      </motion.div>
    </div>
  );
};
