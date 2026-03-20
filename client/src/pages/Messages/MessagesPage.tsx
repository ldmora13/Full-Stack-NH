import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ChatBubble from '../../components/ChatBubble';
import UserAvatar from '../../components/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { TicketService } from '../../services/ticketService';
import { CommentService } from '../../services/commentService';
import type { Comment } from '../../services/commentService';
import { Send, MessageSquare, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { t } from 'i18next';

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

  // Auto-select first ticket
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId) {
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
      <div className="h-[calc(100vh-10rem)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-blue-300">
            {t('messages.title')}
          </h1>
          <p className="text-slate-400 mt-1">{t('messages.subtitle')}</p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
          {/* Left panel: Conversations */}
          <div className="w-80 shrink-0 flex flex-col glass rounded-3xl overflow-hidden">
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
                        'w-full text-left p-3 rounded-xl transition-all',
                        selectedTicketId === ticket.id
                          ? 'bg-blue-500/10 border border-blue-500/30'
                          : 'hover:bg-white/5/30 border border-transparent'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-1 shrink-0">
                          <div className={clsx('w-2 h-2 rounded-full', statusColors[ticket.status] || 'bg-slate-500')} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={clsx(
                            'text-sm font-medium truncate',
                            selectedTicketId === ticket.id ? 'text-blue-300' : 'text-slate-200'
                          )}>
                            {ticket.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            EXP-{ticket.id.toString().padStart(4, '0')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Chat */}
          <div className="flex-1 flex flex-col glass rounded-3xl overflow-hidden min-w-0">
            {selectedTicket ? (
              <>
                {/* Chat header */}
                <div className="p-5 border-b border-white/10 shrink-0 flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{selectedTicket.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={clsx('w-1.5 h-1.5 rounded-full', statusColors[selectedTicket.status])} />
                      <span className="text-xs text-slate-400 capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                      <MessageSquare className="w-10 h-10 text-slate-600" />
                      <p className="text-slate-500">No hay mensajes aún. ¡Inicia la conversación!</p>
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
                <div className="p-4 border-t border-white/10 shrink-0">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('messages.placeholder')}
                        rows={1}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 text-white placeholder-slate-500 transition-all resize-none leading-relaxed text-sm"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || sending}
                      className={clsx(
                        'p-3 rounded-2xl transition-all flex items-center justify-center',
                        message.trim() && !sending
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
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
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                <MessageSquare className="w-16 h-16 text-slate-600" />
                <div>
                  <p className="text-slate-400 font-medium">{t('messages.select_ticket')}</p>
                  <p className="text-slate-500 text-sm mt-1">{t('messages.select_ticket_subtitle')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}