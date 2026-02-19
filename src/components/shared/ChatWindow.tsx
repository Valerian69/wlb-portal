'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  title: string;
  subtitle?: string;
  participantType: 'reporter' | 'internal_admin' | 'external_admin';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ChatWindow({
  messages,
  onSendMessage,
  title,
  subtitle,
  participantType,
  placeholder = 'Type a message...',
  className,
  disabled = false,
}: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current && typeof scrollRef.current.scrollIntoView === 'function') {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getSenderLabel = (sender: ChatMessage['sender']) => {
    switch (sender) {
      case 'reporter':
        return 'Reporter';
      case 'internal_admin':
        return 'Internal Team';
      case 'external_admin':
        return 'External Admin';
      case 'system':
        return 'System';
      default:
        return 'Unknown';
    }
  };

  const getSenderAvatar = (sender: ChatMessage['sender']) => {
    const colors: Record<string, string> = {
      reporter: 'bg-green-500',
      internal_admin: 'bg-blue-500',
      external_admin: 'bg-purple-500',
      system: 'bg-gray-500',
    };
    return colors[sender] || 'bg-gray-400';
  };

  return (
    <div className={cn('flex flex-col h-full border rounded-lg bg-card overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <Badge variant={disabled ? 'secondary' : 'default'} className="text-xs shrink-0">
          {disabled ? 'Read-only' : 'Active'}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender === participantType;
              return (
                <div
                  key={msg.id}
                  className={cn('flex gap-3', isOwn ? 'flex-row-reverse' : 'flex-row')}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={cn('text-xs text-white', getSenderAvatar(msg.sender))}>
                      {getSenderLabel(msg.sender).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : msg.sender === 'system'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getSenderLabel(msg.sender)} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t shrink-0">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[60px] max-h-[120px] resize-none"
              aria-label="Chat message input"
              rows={2}
            />
            <Button type="submit" disabled={disabled || !message.trim()} className="self-end shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
