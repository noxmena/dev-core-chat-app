import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '../api/base44Client';
import { ChatRoom, Message } from '../types';
import { useAuth } from '../lib/DevCoreAuthContext';
import { RoomSelector } from '../components/chat/RoomSelector';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { Terminal, Shield, Cpu, Activity, Info, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CreateRoomModal } from '../components/chat/CreateRoomModal';
import { JoinRoomModal } from '../components/chat/JoinRoomModal';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Rooms & Subscribe
  useEffect(() => {
    if (!user) return;

    const fetchRooms = async () => {
      try {
        const results = await base44.entities.ChatRoom.list();
        // Defensive filtering: Only show rooms where the current user is an authorized member
        const authorizedRooms = results.filter(r => 
          Array.isArray(r.members) && r.members.includes(user.display_name)
        );
        setRooms(authorizedRooms);
        
        if (authorizedRooms.length > 0 && !activeRoomId) {
          setActiveRoomId(authorizedRooms[0].id || null);
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      } finally {
        setIsRoomsLoading(false);
      }
    };

    fetchRooms();

    // Subscribe to room changes to keep the list fresh across the mesh
    const unsubscribe = base44.entities.ChatRoom.subscribe(() => {
      fetchRooms(); // Re-fetch and re-filter when any channel record changes
    });

    return () => unsubscribe();
  }, [user]);

  // Ensure activeRoomId is always authorized
  useEffect(() => {
    if (activeRoomId && rooms.length > 0) {
      const isAuthorized = rooms.some(r => r.id === activeRoomId);
      if (!isAuthorized) {
        setActiveRoomId(rooms[0]?.id || null);
      }
    }
  }, [rooms, activeRoomId]);

  // Load Messages & Subscribe
  useEffect(() => {
    if (!activeRoomId) return;

    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      try {
        const results = await base44.entities.Message.filter({ room_id: activeRoomId }, 'created_date', 100);
        setMessages(results.reverse()); // Show newest at bottom
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setIsMessagesLoading(false);
      }
    };

    fetchMessages();

    // Real-time subscription
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.type === 'create' && event.data.room_id === activeRoomId) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === event.id)) return prev;
          return [...prev, event.data];
        });
      }
    });

    return () => unsubscribe();
  }, [activeRoomId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!activeRoomId || !user) return;

    try {
      const newMessage: Partial<Message> = {
        content,
        image_url: imageUrl,
        sender_name: user.display_name,
        room_id: activeRoomId
      };
      
      const created = await base44.entities.Message.create(newMessage);
      // Subscription will pick it up, but for instant UI feedback:
      setMessages(prev => [...prev, created]);
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const handleAIInvoke = async (content: string) => {
    if (!activeRoomId || !user) return;
    
    setIsAILoading(true);
    try {
      // First, send the user's message
      await handleSendMessage(content);
      
      // Then, invoke AI
      const reply = await base44.integrations.Core.InvokeLLM({
        prompt: `The user ${user.display_name} just said: "${content}". Respond in a helpful, concise way as "DevCore AI".`
      });

      // Save AI message
      const aiMessage: Partial<Message> = {
        content: typeof reply === 'string' ? reply : JSON.stringify(reply),
        sender_name: 'DevCore AI',
        room_id: activeRoomId
      };
      
      await base44.entities.Message.create(aiMessage);
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setIsAILoading(false);
    }
  };

  const selectedRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <div className="flex h-screen bg-bg-deep overflow-hidden font-sans border border-border-dim">
      <RoomSelector 
        rooms={rooms}
        activeRoomId={activeRoomId || undefined}
        onSelectRoom={setActiveRoomId}
        onCreateRoom={() => setShowCreateModal(true)}
        onJoinRoom={() => setShowJoinModal(true)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-deep relative">
        <header className="h-[64px] border-b border-border-dim flex items-center justify-between px-6 bg-bg-side/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-[14px] font-bold text-text-main tracking-tight flex items-center gap-2">
              <span className="text-accent font-mono">#</span> {selectedRoom?.name || 'engineering-general'}
            </h2>
            {selectedRoom?.invite_code && (
              <div className="flex items-center gap-2 bg-bg-card border border-border-dim px-2 py-1 rounded">
                <span className="text-[9px] font-mono text-text-dim uppercase tracking-widest">Invite Code</span>
                <span className="text-xs font-mono font-bold text-accent">{selectedRoom.invite_code}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-accent/10 text-accent font-mono text-[10px] px-2 py-1 rounded border border-accent/20">
                API v1.2 Connected
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar relative">
          <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end gap-5">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <MessageBubble key={msg.id || idx} message={msg} />
              ))}
            </AnimatePresence>
            
            {isAILoading && (
              <div className="flex gap-4 mb-6">
                <div className="w-9 h-9 rounded bg-border-dim flex items-center justify-center shrink-0 border border-border-dim shadow-sm">
                   <Cpu className="w-4 h-4 text-accent animate-pulse" />
                </div>
                <div className="max-w-[85%] flex flex-col gap-1">
                   <div className="bg-bg-card border-l-4 border-accent border border-border-dim px-4 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm">
                      <div className="flex gap-1.5 items-center">
                        <div className="w-1 h-1 bg-accent/40 rounded-full animate-bounce [animation-delay:0s]" />
                        <div className="w-1 h-1 bg-accent/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-1 h-1 bg-accent/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="text-[10px] font-mono text-text-dim ml-2 uppercase tracking-widest">Compiling neural output...</span>
                      </div>
                   </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </main>

        <ChatInput 
          onSendMessage={handleSendMessage} 
          onAIInvoke={handleAIInvoke}
          disabled={!activeRoomId} 
        />
      </div>

      {/* Right Column - SDK & Status */}
      <aside className="w-[280px] bg-bg-side border-l border-border-dim p-[24px] hidden lg:flex flex-col gap-8">
        <div className="space-y-4">
          <h2 className="text-[11px] font-mono text-text-dim uppercase tracking-[0.15em] flex items-center gap-2">
             Active Session
          </h2>
          <div className="space-y-3">
            <div className="bg-bg-deep p-3 rounded-lg border border-border-dim">
              <div className="text-[10px] text-text-dim mb-1">Identity</div>
              <div className="text-[13px] font-mono font-medium text-text-main">{user?.display_name || 'Yusef'}</div>
            </div>
            <div className="bg-bg-deep p-3 rounded-lg border border-border-dim">
              <div className="text-[10px] text-text-dim mb-1">Team Scope</div>
              <div className="text-[13px] font-mono font-medium text-text-main">{user?.team || 'Zerobyte'} / Admin</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[11px] font-mono text-text-dim uppercase tracking-[0.15em] flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Real-time Subscription
          </h2>
          <div className="text-[12px] text-text-dim leading-[1.6] font-sans">
            Listening to <code className="bg-bg-deep px-1 rounded text-accent font-mono">entities.Message.subscribe()</code> for room <code className="text-accent font-mono">#{selectedRoom?.name || 'gen-001'}</code>.
          </div>
        </div>

        <div className="mt-auto space-y-4">
           <h2 className="text-[11px] font-mono text-text-dim uppercase tracking-[0.15em]">Channel Assets</h2>
           {selectedRoom?.invite_code && (
              <div className="bg-bg-deep p-3 rounded-lg border border-border-dim">
                <div className="text-[10px] text-text-dim mb-1 italic">Mesh Security Token</div>
                <div className="text-[16px] font-mono font-bold text-accent tracking-widest">{selectedRoom.invite_code}</div>
              </div>
           )}
           <div className="bg-bg-deep p-3 rounded-lg border border-border-dim">
              <div className="text-[10px] text-text-dim mb-1">API Key</div>
              <div className="text-[13px] font-mono font-medium text-text-main truncate">b48f90...8a3b</div>
           </div>
           <div className="flex items-center gap-2 px-1">
             <div className="w-full h-1 bg-border-dim rounded-full overflow-hidden">
                <div className="w-[65%] h-full bg-accent rounded-full"></div>
             </div>
             <span className="text-[9px] font-mono text-text-dim">65%</span>
           </div>
        </div>
      </aside>

      {/* Modals */}
      {showCreateModal && <CreateRoomModal isOpen={true} onClose={() => setShowCreateModal(false)} onCreated={(room) => {
          setRooms(prev => [...prev, room]);
          setActiveRoomId(room.id || null);
          setShowCreateModal(false);
      }} />}
      
      {showJoinModal && <JoinRoomModal isOpen={true} onClose={() => setShowJoinModal(false)} onJoined={(room) => {
          setRooms(prev => prev.some(r => r.id === room.id) ? prev : [...prev, room]);
          setActiveRoomId(room.id || null);
          setShowJoinModal(false);
      }} />}
    </div>
  );
};
