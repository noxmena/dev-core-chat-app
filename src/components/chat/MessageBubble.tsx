import React from 'react';
import { Message } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { useAuth } from '../../lib/DevCoreAuthContext';
import { User, Bot } from 'lucide-react';

import { CodeBlock } from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const isMe = message.sender_name === user?.display_name;
  const isAI = message.sender_name === 'DevCore AI';

  return (
    <div className={cn(
      "flex w-full mb-2 gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
      isMe ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-9 h-9 rounded flex items-center justify-center shrink-0 border font-bold text-xs",
        isMe ? "bg-[#4F46E5] border-[#4F46E5] text-white" : (isAI ? "bg-[#0EA5E9] border-[#0EA5E9] text-white" : "bg-border-dim border-border-dim text-text-main")
      )}>
        {isMe ? (user?.display_name?.[0] || 'U') : (isAI ? 'AI' : (message.sender_name?.[0] || '?'))}
      </div>

      <div className={cn(
        "max-w-[85%] flex flex-col gap-1",
        isMe ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-3 px-1">
          <span className="text-[12px] font-semibold text-text-main">
            {message.sender_name}
          </span>
          <span className="text-[12px] font-mono text-text-dim">
            {message.created_date ? formatDate(message.created_date) : '14:20:05'}
          </span>
        </div>

        <div className={cn(
          "px-4 py-3 rounded-br-xl rounded-bl-xl border border-border-dim text-[14px] leading-relaxed transition-colors",
          isMe 
            ? "bg-bg-card text-text-main rounded-tl-xl" 
            : (isAI 
                ? "bg-bg-card border-l-[3px] border-l-accent text-text-main rounded-tr-xl" 
                : "bg-bg-card text-text-main rounded-tr-xl")
        )}>
          {message.image_url && (
            <img 
              src={message.image_url} 
              alt="Uploaded content" 
              className="max-w-full rounded-lg mb-3 border border-zinc-800 shadow-md"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="prose prose-invert prose-sm max-w-none">
            <CodeBlock content={message.content || ''} />
          </div>
        </div>
      </div>
    </div>
  );
};
