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

    // Carrega Google Translate dinamicamente
    useEffect(() => {
        if (document.getElementById('google-translate-script')) return;

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                { pageLanguage: 'pt' },
                'google_translate_element'
            );
        };

        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'pt', label: 'Português' },
    ];

    const handleLanguageChange = (code) => {
        const gtSelect = document.querySelector('.goog-te-combo');
        if (gtSelect) {
            gtSelect.value = code;
            gtSelect.dispatchEvent(new Event('change'));
            setLangDropdownOpen(false);
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

                    <div className="flex items-center space-x-4">
                        {/* Dropdown de Idiomas */}
                        <div className="relative" ref={langDropdownRef}>
                            <button
                                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                                className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition"
                            >
                                Idioma
                            </button>

                            {langDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dropdown do usuário */}
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
                                        <Link
                                            href={"#"} // Página de perfil
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
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 shadow mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Fertilizer Clinic Management System
                </div>
            </footer>

            {/* Google Translate (oculto) */}
            <div id="google_translate_element" className="hidden"></div>
        </div>
    );
}
