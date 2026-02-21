import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            await signup(data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(t('auth.errors.signup_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative">
            <div className="absolute top-4 right-4">
                <LanguageSelector />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                        {t('auth.signup.title')}
                    </h2>
                    <p className="mt-2 text-slate-400">{t('auth.signup.subtitle')}</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <Input
                        name="name"
                        type="text"
                        label={t('auth.fields.name')}
                        placeholder="Juan Pérez"
                        required
                    />

                    <Input
                        name="email"
                        type="email"
                        label={t('auth.fields.email')}
                        placeholder="usuario@ejemplo.com"
                        required
                    />

                    <Input
                        name="password"
                        type="password"
                        label={t('auth.fields.password')}
                        placeholder="••••••••"
                        required
                    />

                    <Button type="submit" isLoading={loading}>
                        {t('auth.signup.action')}
                    </Button>
                </form>

                <p className="text-center text-sm text-slate-500">
                    {t('auth.signup.has_account')}{' '}
                    <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                        {t('auth.signup.login_link')}
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
