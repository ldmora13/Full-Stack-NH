import { useState } from 'react';
import { CommentService } from '../services/commentService';
import { Send } from 'lucide-react';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';

interface CommentFormProps {
    ticketId: number;
    onCommentCreated: () => void;
}

export default function CommentForm({ ticketId, onCommentCreated }: CommentFormProps) {
    const { t } = useTranslation();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await CommentService.create(ticketId, content);
            setContent('');
            onCommentCreated();
        } catch (error) {
            console.error('Error creating comment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3">
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('comments.placeholder')}
                className="flex-1 px-4 py-3 bg-black/30/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white transition-all placeholder:text-slate-500"
            />
            <Button type="submit" isLoading={loading} disabled={!content.trim()}>
                <Send className="w-4 h-4" />
                {t('comments.send')}
            </Button>
        </form>
    );
}
