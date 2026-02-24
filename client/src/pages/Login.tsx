import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

export default function Login() {
    const { login } = useAuth();
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
            await login(data);
            navigate('/dashboard');
        } catch (err: any) {
            // Axios error handling would be better here getting 'err.response?.data?.error'
            setError(t('auth.errors.invalid_credentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            <div className="absolute top-4 right-4">
                <LanguageSelector />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-300">
                        {t('auth.login.welcome')}
                    </h2>
                    <p className="mt-2 text-slate-400">{t('auth.login.subtitle')}</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

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
                        {t('auth.login.action')}
                    </Button>
                </form>

                <p className="text-center text-sm text-slate-500">
                    {t('auth.login.no_account')}{' '}
                    <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                        {t('auth.login.register_link')}
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
