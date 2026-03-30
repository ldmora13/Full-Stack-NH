import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ChatBubble from '../../components/ChatBubble';
import UserAvatar from '../../components/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { TicketService } from '../../services/ticketService';
import { CommentService } from '../../services/commentService';
import type { Comment } from '../../services/commentService';
import { Send, MessageSquare, Paperclip, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface ConversationItem {
  id: number;
  title: string;
  status: string;
  type: string;
  lastComment?: Comment;
  unreadCount?: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch tickets (conversations)
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets-conversations'],
    queryFn: () => TicketService.getAll({ limit: 20 }),
    refetchInterval: 15000,
  });

  // Fetch comments for selected ticket
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['comments', selectedTicketId],
    queryFn: () => selectedTicketId ? CommentService.getByTicket(selectedTicketId) : Promise.resolve([]),
    enabled: !!selectedTicketId,
    refetchInterval: 10000,
  });

  const tickets = ticketsData?.tickets || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Auto-select first ticket ONLY on desktop
  useEffect(() => {
    if (window.innerWidth >= 768 && tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSend = async () => {
    if (!message.trim() || !selectedTicketId) return;
    setSending(true);
    try {
      await CommentService.create(selectedTicketId, message.trim());
      setMessage('');
      refetchComments();
    } catch (e) {
      toast.error('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-400',
    IN_PROGRESS: 'bg-amber-400',
    RESOLVED: 'bg-emerald-400',
    CLOSED: 'bg-slate-500',
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-10rem)] flex flex-col max-w-7xl mx-auto w-full">
        <div className={clsx("mb-6 transition-all duration-300", selectedTicketId && "hidden md:block")}>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-blue-300">
            {t('messages.title')}
          </h1>
          <p className="text-slate-400 mt-1">{t('messages.subtitle')}</p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden relative">
          {/* Left panel: Conversations */}
          <div className={clsx(
            "w-full md:w-80 shrink-0 flex flex-col glass rounded-3xl overflow-hidden transition-all duration-300",
            selectedTicketId ? "hidden md:flex" : "flex"
          )}>
            <div className="p-4 border-b border-white/10 shrink-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t('messages.tickets')} ({tickets.length})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-600" />
                  <p className="text-slate-500 text-sm">{t('messages.no_conversations')}</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={clsx(
                        'w-full text-left p-4 rounded-2xl transition-all relative group',
                        selectedTicketId === ticket.id
                          ? 'bg-blue-500/10 border border-blue-500/30'
                          : 'hover:bg-white/5 border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          <div className={clsx('w-3 h-3 rounded-full shadow-lg', statusColors[ticket.status] || 'bg-slate-500')} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={clsx(
                            'text-sm font-semibold truncate transition-colors',
                            selectedTicketId === ticket.id ? 'text-blue-300' : 'text-slate-200 group-hover:text-white'
                          )}>
                            {ticket.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-500 font-mono">
                              EXP-{ticket.id.toString().padStart(4, '0')}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Chat */}
          <div className={clsx(
            "flex-1 flex flex-col glass rounded-3xl overflow-hidden min-w-0 transition-all duration-300",
            selectedTicketId ? "flex" : "hidden md:flex"
          )}>
            {selectedTicket ? (
              <>
                {/* Chat header */}
                <div className="p-4 md:p-5 border-b border-white/10 shrink-0 flex items-center gap-4 bg-white/5/30">
                  <button 
                    onClick={() => setSelectedTicketId(null)}
                    className="md:hidden p-2 -ml-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate text-sm md:text-base">{selectedTicket.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={clsx('w-2 h-2 rounded-full', statusColors[selectedTicket.status])} />
                      <span className="text-[11px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">{selectedTicket.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin bg-black/10">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                        <MessageSquare className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium">{t('messages.no_messages')}</p>
                      <p className="text-slate-500 text-sm max-w-50">{t('messages.start_conversation')}</p>
                    </div>
                  ) : (
                    <>
                      <AnimatePresence>
                        {comments.map((comment, i) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                          >
                            <ChatBubble
                              content={comment.content}
                              author={comment.user.name}
                              timestamp={comment.createdAt}
                              isOwn={comment.userId === user?.id}
                              role={comment.user.role}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 shrink-0 bg-white/5/20">
                  <div className="flex items-end gap-3 max-w-4xl mx-auto w-full">
                    <div className="flex-1 relative group">
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('messages.placeholder')}
                        rows={1}
                        className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 text-white placeholder-slate-500 transition-all resize-none leading-relaxed text-sm shadow-inner"
                        style={{ minHeight: '52px', maxHeight: '160px' }}
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || sending}
                      className={clsx(
                        'w-12 h-12 rounded-2xl mb-3 transition-all flex items-center justify-center shrink-0',
                        message.trim() && !sending
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      )}
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-8 bg-black/5">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-blue-500/10 flex items-center justify-center animate-pulse">
                    <MessageSquare className="w-12 h-12 text-blue-500/50" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{t('messages.select_ticket')}</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                    {t('messages.select_ticket_subtitle')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}