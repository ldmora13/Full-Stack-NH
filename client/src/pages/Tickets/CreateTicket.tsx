import { useState, useRef, useEffect } from 'react';
import { TicketService } from '../../services/ticketService';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    X,
    Paperclip,
    UploadCloud,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Layout from '../../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../context/AuthContext';
import { TICKET_CONFIG } from '../../config/ticketConfig';


export default function CreateTicket() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        type: 'WORK_VISA'
    });

    // Redirect clients immediately
    useEffect(() => {
        if (user?.role === 'CLIENT') {
            navigate('/tickets', { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await TicketService.create(formData);
            navigate('/tickets');
        } catch (error) {
            console.error('Error creating ticket', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Layout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-slate-400 hover:text-blue-400 mb-8 transition-colors"
                >
                    <div className="p-2 rounded-full bg-slate-800/50 group-hover:bg-blue-500/10 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{t('ticket.create.back')}</span>
                </button>

                <div className="bg-white/5/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
                    <div className="mb-8 border-b border-white/10 pb-6">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-300">
                            {t('ticket.create.title')}
                        </h1>
                        <p className="text-slate-400 mt-2">
                            {t('ticket.create.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <Input
                                name="title"
                                label={t('ticket.fields.subject')}
                                placeholder={t('ticket.placeholders.subject')}
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="bg-black/30/50 border-white/10 focus:border-blue-500/50"
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-4">
                                    {t('ticket.fields.type')}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(TICKET_CONFIG).map(([key, config]) => {
                                        const Icon = config.icon;
                                        const isSelected = formData.type === key;
                                        return (
                                            <div
                                                key={key}
                                                onClick={() => setFormData({ ...formData, type: key })}
                                                className={`
                                                    cursor-pointer p-4 rounded-xl border transition-all duration-200 group
                                                    ${isSelected
                                                        ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-emerald-500/10'
                                                        : 'bg-white/5/50 border-white/10 hover:border-blue-500/30 hover:bg-slate-800/50'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`
                                                        p-2.5 rounded-lg transition-colors
                                                        ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10'}
                                                    `}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-medium mb-1 ${isSelected ? 'text-blue-400' : 'text-slate-200 group-hover:text-white'}`}>
                                                            {t(`ticket_config.types.${key}.label`, config.label)}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 leading-relaxed">
                                                            {t(`ticket_config.types.${key}.description`, config.description)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('ticket.fields.priority')}
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-black/30/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="LOW">🟢 {t('ticket_priority.LOW')}</option>
                                            <option value="MEDIUM">🔵 {t('ticket_priority.MEDIUM')}</option>
                                            <option value="HIGH">🟠 {t('ticket_priority.HIGH')}</option>
                                            <option value="URGENT">🔴 {t('ticket_priority.URGENT')}</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        {t('ticket.create.priority_help')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {t('ticket.fields.description')}
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-black/30/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white placeholder-slate-600 transition-all resize-none leading-relaxed"
                                    placeholder={t('ticket.placeholders.description')}
                                />
                            </div>

                            {/* File Attachment Section */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {t('ticket.fields.attachments')}
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl p-8 transition-all cursor-pointer text-center group"
                                >
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <p className="text-slate-300 font-medium">{t('ticket.upload.click_to_upload')}</p>
                                    <p className="text-slate-500 text-sm mt-1">{t('ticket.upload.drag_and_drop')}</p>
                                </div>

                                {/* File List */}
                                <AnimatePresence>
                                    {files.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 space-y-2 overflow-hidden"
                                        >
                                            {files.map((file, index) => (
                                                <motion.div
                                                    key={`${file.name}-${index}`}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-700 rounded-lg">
                                                            <Paperclip className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-200">{file.name}</p>
                                                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded-lg transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/tickets')}
                                className="border-slate-700 hover:bg-slate-800 text-slate-300"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" isLoading={loading}>
                                {loading ? t('ticket.create.submitting') : t('ticket.create.submit')}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </Layout>
    );
}
