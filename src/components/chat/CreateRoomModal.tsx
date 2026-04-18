import React, { useState } from 'react';
import { X, Hash, Info, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { base44 } from '../../api/base44Client';
import { useAuth } from '../../lib/DevCoreAuthContext';
import { ChatRoom } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (room: ChatRoom) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setIsBusy(true);
    setError('');

    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newRoom = await base44.entities.ChatRoom.create({
        name,
        description,
        invite_code: inviteCode,
        members: [user.display_name]
      });
      onCreated(newRoom);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize channel blueprint');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-bold uppercase tracking-tight text-sm">Create New Mesh Channel</h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Blueprint Specification v2.1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-200/80 font-mono italic">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
              <Hash className="w-3 h-3" /> Channel Identifier (Name)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="internal-ops-general"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 transition-all font-mono text-sm"
              maxLength={32}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
              <Info className="w-3 h-3" /> Metadata (Description)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Protocol for inter-team coordination..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 transition-all font-sans text-sm resize-none h-24"
              maxLength={256}
            />
          </div>

          <button
            type="submit"
            disabled={isBusy || !name.trim()}
            className="w-full bg-zinc-100 text-zinc-950 font-bold py-4 rounded-xl hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-mono text-[11px] uppercase tracking-tighter">Committing Blueprint...</span>
              </>
            ) : (
              <span className="uppercase tracking-widest text-xs">Initialize Channel</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
