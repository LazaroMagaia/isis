import { usePage, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import UTIL from '@/util.js';

export default function DashboardLayout({ title, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const langDropdownRef = useRef(null);

    // Fecha dropdowns se clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setLangDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Função para obter a rota de edição de perfil baseada no role
    const getEditProfileRoute = () => {
        switch (user?.role) {
            case 'admin':
                return 'admin.profile.edit';
            case 'doctor':
                return 'doctor.profile.edit';
            case 'nurse':
                return 'nurse.profile.edit';
            case 'secretary':
                return 'secretary.profile.edit';
            case 'patient':
                return 'patient.profile.edit';
            default:
                return 'profile.edit'; // fallback
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {title || 'Dashboard'}
                    </h1>

                    {/* Dropdown usuário */}
                    <div className="relative" ref={userDropdownRef}>
                        <button
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <img
                                src={user?.avatar || UTIL.images.avatars.user}
                                alt="Perfil"
                                className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                            />
                            <span className="hidden sm:block">{user?.name}</span>
                        </button>

                        {userDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                                <div className="py-1">
                                    {/* Link perfil usando função */}
                                    <Link
                                        href={route(getEditProfileRoute())}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Perfil
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Conteúdo principal */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 shadow mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Fertilizer Clinic Management System
                </div>
            </footer>
        </div>
    );
}
