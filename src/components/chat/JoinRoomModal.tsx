import React, { useState } from 'react';
import { X, Key, Loader2, AlertTriangle, ChevronRight } from 'lucide-react';
import { base44 } from '../../api/base44Client';
import { useAuth } from '../../lib/DevCoreAuthContext';
import { ChatRoom } from '../../types';
import { motion } from 'motion/react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (room: ChatRoom) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onClose, onJoined }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !user) return;

    setIsBusy(true);
    setError('');

    try {
      const results = await base44.entities.ChatRoom.filter({ invite_code: inviteCode.trim().toUpperCase() });
      const room = results[0];

      if (!room || !room.id) {
        throw new Error('Access Denied: Invalid Security Token (Invite Code)');
      }

      // Check if already a member
      const members = room.members || [];
      if (!members.includes(user.display_name)) {
        const updatedMembers = [...members, user.display_name];
        await base44.entities.ChatRoom.update(room.id, { members: updatedMembers });
        onJoined({ ...room, members: updatedMembers });
      } else {
        onJoined(room);
      }
    } catch (err: any) {
      setError(err.message || 'Mesh handshake failed. Check your credentials.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
              <Key className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-bold uppercase tracking-tight text-sm">Join Remote Channel</h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Protocol HANDSHAKE v1.0</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-200/80 font-mono italic">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Enter the unique 6-character Mesh Security Token provided by the channel administrator.
            </p>
            <input
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="TOKEN (E.G. AX79LQ)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-5 px-4 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 transition-all font-mono text-xl tracking-[0.5em] text-center uppercase"
              maxLength={12}
            />
          </div>

          <button
            type="submit"
            disabled={isBusy || !inviteCode.trim()}
            className="w-full bg-zinc-100 text-zinc-950 font-bold py-4 rounded-xl hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-mono text-[11px] uppercase tracking-tighter">Verified Handshake...</span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                 <span className="uppercase tracking-widest text-xs">Request Access</span>
                 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
