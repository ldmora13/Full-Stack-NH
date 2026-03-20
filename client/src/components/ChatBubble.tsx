import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import UserAvatar from './UserAvatar';

interface ChatBubbleProps {
  content: string;
  author: string;
  timestamp: string;
  isOwn: boolean;
  role: 'CLIENT' | 'ADMIN' | 'ADVISOR';
}

export default function ChatBubble({ content, author, timestamp, isOwn, role }: ChatBubbleProps) {
  const timeAgo = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className={clsx('flex items-end gap-2.5 group', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {isOwn && (
          <UserAvatar className='mb-5' name={author} role={role} size="sm" showBadge />
        )}
      <div className={clsx('flex flex-col gap-1 max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={clsx(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm',
            isOwn
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-bl-sm'
          )}
        >
          {content}
        </div>

        {!isOwn && (
          <span className="text-xs text-slate-500 font-medium px-1">{author}</span>
        )}
        <span className="text-[10px] text-slate-600 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {timeAgo}
        </span>
      </div>
    </div>
  );
}