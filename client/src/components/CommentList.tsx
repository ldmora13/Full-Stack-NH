import type { Comment } from '../services/commentService';
import { UserCircle, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface CommentListProps {
    comments: Comment[];
}

const roleConfig = {
    CLIENT: { icon: UserCircle, color: 'text-blue-400' },
    ADVISOR: { icon: Users, color: 'text-blue-400' },
    ADMIN: { icon: Shield, color: 'text-purple-400' },
};

export default function CommentList({ comments }: CommentListProps) {
    const { t, i18n } = useTranslation();

    if (comments.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">{t('comments.no_comments')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {comments.map((comment, index) => {
                    const RoleIcon = roleConfig[comment.user.role].icon;
                    const roleColor = roleConfig[comment.user.role].color;

                    return (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/5/40 backdrop-blur-sm border border-white/10/50 rounded-2xl p-4 hover:bg-white/5/60 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                                        <RoleIcon className={`w-5 h-5 ${roleColor}`} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="font-semibold text-white">{comment.user.name}</span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(comment.createdAt).toLocaleString(i18n.language, {
                                                dateStyle: 'short',
                                                timeStyle: 'short'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
