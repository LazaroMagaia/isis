import { Head, Link, useForm } from '@inertiajs/react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import UTIL from '@/util.js';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
                {/* Lado da imagem */}
                <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 items-center justify-center">
                    <img
                        src={UTIL.images.default + 'static/doctor01.jpg'}
                        alt="Imagem de login"
                        className="w-full h-[100vh] object-cover"
                    />
                </div>

                {/* Lado do formulário */}
                <div className="flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900">
                    <div className="w-full max-w-md">
                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                                {status}
                            </div>
                        )}

                        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                            Login
                        </h2>

                        <form onSubmit={submit} className="grid grid-cols-12 gap-4">
                            {/* Login */}
                            <div className="col-span-12">
                                <InputLabel
                                    htmlFor="login"
                                    value="Email ou Telefone"
                                    className="text-primary-dark dark:text-primary-light"
                                />
                                <TextInput
                                    id="login"
                                    type="text"
                                    name="login"
                                    value={data.login}
                                    className="mt-1 block w-full border border-secondary-dark rounded-md px-3 py-2
                                    ocus:ring-primary placeholder-gray-800 focus:outline-none focus:ring-1
                                    focus:border-primary-dark dark:bg-gray-800 dark:text-white"
                                    autoComplete="username"
                                    isFocused={true}
                                    placeholder="Digite seu email ou número de telefone"
                                    onChange={(e) => setData('login', e.target.value)}
                                />
                                <InputError message={errors.login} className="mt-2 text-red-500" />
                            </div>

                            {/* Senha */}
                            <div className="col-span-12">
                                <InputLabel
                                    htmlFor="password"
                                    value="Senha"
                                    className="text-primary-dark dark:text-primary-light"
                                />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full border border-secondary-dark rounded-md px-3 py-2
                                    placeholder-gray-800 focus:outline-none focus:ring-1 focus:ring-primary
                                    focus:border-primary-dark dark:bg-gray-800 dark:text-white"
                                    autoComplete="current-password"
                                    placeholder="Digite sua senha"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-2 text-red-500" />
                            </div>

                            {/* Lembrar-me */}
                            <div className="col-span-12 flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ms-2 text-sm text-gray-800 dark:text-secondary-light">
                                    Lembrar-me
                                </span>
                            </div>

                            {/* Ações */}
                            <div className="col-span-12 flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-gray-800 dark:text-secondary-light underline hover:text-primary-dark dark:hover:text-primary-light"
                                    >
                                        Esqueceu sua senha?
                                    </Link>
                                )}
                                <PrimaryButton
                                    className="sm:ms-4 w-full sm:w-auto bg-primary DEFAULT hover:bg-primary-dark text-white"
                                    disabled={processing}
                                >
                                    Entrar
                                </PrimaryButton>
                            </div>

                            {/* Link para registrar */}
                            <div className="col-span-12 text-center mt-4">
                                <span className="text-sm text-gray-800 dark:text-secondary-light">
                                    Não tem uma conta?{' '}
                                    <Link
                                        href={route('register')}
                                        className="underline hover:text-primary-dark dark:hover:text-primary-light"
                                    >
                                        Registre-se
                                    </Link>
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
