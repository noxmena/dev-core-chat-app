import React, { useState, useRef } from 'react';
import { Send, Plus, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '../../api/base44Client';
import { cn } from '../../lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string, imageUrl?: string) => void;
  onAIInvoke?: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onAIInvoke, disabled }) => {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !previewUrl) || disabled) return;
    onSendMessage(content, previewUrl || undefined);
    setContent('');
    setPreviewUrl(null);
  };

  const handleAIInvoke = () => {
    if (!content.trim() || disabled || !onAIInvoke) return;
    onAIInvoke(content);
    setContent('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPreviewUrl(file_url);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 border-t border-border-dim bg-bg-deep/80 backdrop-blur-md">
      {previewUrl && (
        <div className="mb-4 relative inline-block animate-in zoom-in-95 duration-200">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="h-20 w-auto rounded-lg border border-border-dim shadow-xl"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={() => setPreviewUrl(null)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
          >
            <div className="w-3 h-3 flex items-center justify-center text-[8px]">×</div>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="input-wrapper bg-bg-card border border-border-dim rounded-lg p-3 flex items-center gap-3 max-w-5xl mx-auto shadow-sm focus-within:border-accent/50 transition-all">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-text-dim hover:text-text-main transition-colors disabled:opacity-50"
          disabled={disabled || isUploading}
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5 font-bold" />}
        </button>

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={disabled ? "Select a channel..." : "Message channel..."}
          className="flex-1 bg-transparent border-none text-[14px] text-text-main placeholder:text-text-dim focus:ring-0 outline-none"
          disabled={disabled}
        />
        
        <div className="flex gap-2 items-center">
            {onAIInvoke && (
              <button
                type="button"
                onClick={handleAIInvoke}
                className={cn(
                  "p-1.5 rounded transition-all disabled:opacity-50",
                  content.trim() ? "text-accent hover:bg-accent/10" : "text-text-dim/50"
                )}
                disabled={disabled || !content.trim()}
                title="Invoke AI"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={disabled || (!content.trim() && !previewUrl)}
              className="text-accent font-bold text-[14px] px-2 hover:opacity-80 transition-all disabled:opacity-30 disabled:text-text-dim shrink-0"
            >
              Send
            </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
      </form>
    </div>
  );
};
