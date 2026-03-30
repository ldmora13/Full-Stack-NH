import { useState } from 'react';
import { UserService } from '../../services/userService';
import type { CreateUserData } from '../../services/userService';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface CreateUserModalProps {
    onClose: () => void;
    onUserCreated: () => void;
}

export default function CreateUserModal({ onClose, onUserCreated }: CreateUserModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateUserData>({
        email: '',
        password: '',
        name: '',
        role: 'CLIENT',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value as any,
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await UserService.create(formData);
            onUserCreated();
        } catch (err: any) {
            setError(err.response?.data?.error || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">{t('modals.create_user.title')}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            name="name"
                            label={t('modals.create_user.fields.name')}
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Juan Pérez"
                        />

                        <Input
                            name="email"
                            type="email"
                            label={t('modals.create_user.fields.email')}
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="usuario@ejemplo.com"
                        />

                        <Input
                            name="password"
                            type="password"
                            label={t('modals.create_user.fields.password')}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Mínimo 8 caracteres"
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t('modals.create_user.fields.role')}
                            </label>
                            <div className="w-full flex gap-2">
                            {([
                                { value: "CLIENT", label: t('roles.CLIENT') },
                                { value: "ADVISOR", label: t('roles.ADVISOR') },
                                { value: "ADMIN", label: t('roles.ADMIN') },
                            ] as const).map((role) => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, role: role.value }))
                                    }
                                    className={`flex-1 px-4 py-3 rounded-xl border transition-all text-white
                                    ${
                                    formData.role === role.value
                                        ? "border-purple-500/50 ring-2 ring-purple-500/10"
                                        : "bg-black/30 border-white/10 hover:border-purple-500/30"
                                    }
                                `}
                                >
                                {role.label}
                                </button>
                            ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                {t('common.cancel')}
                            </Button>
                            <Button variant='secondary' type="submit" isLoading={loading} className="flex-1">
                                <Save className="w-4 h-4" />
                                {loading ? t('modals.create_user.submitting') : t('modals.create_user.submit')}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
