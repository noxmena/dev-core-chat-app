import React from 'react';
import { ChatRoom } from '../../types';
import { Hash, Plus, LogOut, Settings, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/DevCoreAuthContext';
import { useNavigate } from 'react-router-dom';

interface RoomSelectorProps {
  rooms: ChatRoom[];
  activeRoomId?: string;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({ 
  rooms, 
  activeRoomId, 
  onSelectRoom, 
  onCreateRoom,
  onJoinRoom
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-[260px] bg-bg-side border-r border-border-dim flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-[24px] border-b border-border-dim">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center font-bold text-black text-lg transition-transform hover:scale-105" />
          <h1 className="font-bold text-text-main text-lg tracking-tight">DevCore</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        <label className="block px-3 mb-4 text-[11px] font-mono text-text-dim uppercase tracking-[0.1em]">
          Mesh Channels
        </label>
        
        <div className="space-y-1">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => room.id && onSelectRoom(room.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] transition-all group",
                activeRoomId === room.id 
                  ? "bg-bg-card text-text-main font-medium shadow-sm" 
                  : "text-text-dim hover:text-text-main hover:bg-bg-card/50"
              )}
            >
              <Hash className={cn(
                "w-3.5 h-3.5",
                activeRoomId === room.id ? "text-accent" : "text-text-dim/50 group-hover:text-accent/50"
              )} />
              <div className="flex-1 text-left truncate">
                {room.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-border-dim space-y-2">
        <button 
          onClick={onJoinRoom}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border-dim text-[13px] text-text-dim hover:text-text-main hover:bg-bg-card transition-all"
        >
          <Users className="w-3.5 h-3.5" />
          Join Channel
        </button>
        <button 
          onClick={onCreateRoom}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bg-card border border-border-dim text-[13px] text-text-main hover:bg-zinc-800 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
          Create Channel
        </button>
      </div>

      <div className="p-4 bg-bg-deep/50 border-t border-border-dim">
        <div className="flex items-center justify-between mb-3 px-1">
           <span className="text-[10px] font-mono text-text-dim uppercase tracking-widest">Active session</span>
           <button onClick={logout} title="Sign Out">
              <LogOut className="w-3.5 h-3.5 text-text-dim hover:text-red-400 transition-colors" />
           </button>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 p-2 rounded-lg bg-bg-card/50 hover:bg-bg-card transition-all text-left group"
        >
          <div className="w-8 h-8 rounded bg-border-dim flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-text-dim group-hover:text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-main truncate">{user?.display_name}</p>
            <p className="text-[10px] font-mono text-text-dim truncate">{user?.team}</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-text-dim group-hover:text-text-main" />
        </button>
      </div>
    </div>
  );
};

const User = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
