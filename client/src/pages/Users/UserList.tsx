import { useState, useEffect } from 'react';
import { UserService } from '../../services/userService';
import type { User } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Plus, UserCircle, Shield, Users as UsersIcon, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import CreateUserModal from './CreateUserModal.tsx';
import { useTranslation } from 'react-i18next';

const roleConfig = {
    CLIENT: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: UserCircle },
    ADVISOR: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: UsersIcon },
    ADMIN: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Shield },
};

export default function UserList() {
    const { user: currentUser, setUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [switchingUser, setSwitchingUser] = useState<string | null>(null);
    const { t } = useTranslation();

    // Redirect if not admin
    if (currentUser?.role !== 'ADMIN') {
        navigate('/dashboard');
        return null;
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const data = await UserService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users', error);
        } finally {
            setLoading(false);
        }
    }

    const handleUserCreated = () => {
        setShowCreateModal(false);
        loadUsers();
    };

    const handleLoginAs = async (userId: string) => {
        setSwitchingUser(userId);
        try {
            const user = await UserService.loginAs(userId);
            setUser(user);
            navigate('/dashboard');
            window.location.reload(); // Force full refresh to update session
        } catch (error) {
            console.error('Error switching user:', error);
        } finally {
            setSwitchingUser(null);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                        {t('nav.users')}
                    </h1>
                    <p className="text-slate-400 mt-1 text-lg">{t('users.subtitle')}</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="w-auto shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all">
                    <Plus className="w-5 h-5" />
                    {t('users.create_new')}
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500">{t('common.loading')}</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl overflow-hidden shadow-2xl shadow-black/20"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-950/30 border-b border-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{t('common.user')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{t('auth.fields.email')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{t('common.role')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{t('common.date')}</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {users.map((user) => {
                                    const RoleIcon = roleConfig[user.role].icon;
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                        <span className="text-emerald-400 font-bold text-sm">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="text-slate-200 font-medium group-hover:text-white transition-colors">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleConfig[user.role].bg} ${roleConfig[user.role].color} border border-opacity-20 border-${roleConfig[user.role].color.split('-')[1]}-500 shadow-sm`}>
                                                    <RoleIcon className="w-3.5 h-3.5" />
                                                    {t(`roles.${user.role}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleLoginAs(user.id)}
                                                    isLoading={switchingUser === user.id}
                                                    disabled={switchingUser !== null || user.id === currentUser.id}
                                                    className="text-xs py-1.5 h-auto border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                                                >
                                                    <LogIn className="w-3.5 h-3.5" />
                                                    {user.id === currentUser.id ? t('users.current') : t('users.login_as')}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {showCreateModal && (
                <CreateUserModal
                    onClose={() => setShowCreateModal(false)}
                    onUserCreated={handleUserCreated}
                />
            )}
        </Layout>
    );
}
