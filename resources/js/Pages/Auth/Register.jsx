import { Head, Link, useForm } from '@inertiajs/react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import UTIL from '@/util.js';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone_1: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Registro" />

            <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
                {/* Lado da imagem */}
                <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 items-center justify-center">
                    <img
                        src={UTIL.images.default + 'static/doctor01.jpg'}
                        alt="Imagem de registro"
                        className="w-full h-[100vh] object-cover"
                    />
                </div>

                {/* Lado do formulário */}
                <div className="flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900">
                    <div className="w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                            Criar Conta
                        </h2>

                        <form onSubmit={submit} className="grid grid-cols-12 gap-4">
                            {/* Nome */}
                            <div className="col-span-12">
                                <InputLabel
                                    htmlFor="name"
                                    value="Nome"
                                    className="text-primary-dark dark:text-primary-light"
                                />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full border border-secondary-dark rounded-md px-3 py-2
                                        placeholder-gray-800 focus:outline-none focus:ring-1  focus:ring-primary
                                        focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2 text-red-500" />
                            </div>

                            {/* Email */}
                            <div className="col-span-12">
                                <InputLabel
                                    htmlFor="email"
                                    value="E-mail"
                                    className="text-primary-dark dark:text-primary-light"
                                />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full border border-secondary-dark rounded-md px-3 py-2
                                        placeholder-gray-800 focus:outline-none focus:ring-1  focus:ring-primary
                                        focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-2 text-red-500" />
                            </div>

                            {/* Telefone */}
                            <div className="col-span-12">
                                <InputLabel
                                    htmlFor="phone_1"
                                    value="Telefone"
                                    className="text-primary-dark dark:text-primary-light"
                                />
                                <TextInput
                                    id="phone_1"
                                    type="text"
                                    name="phone_1"
                                    value={data.phone_1}
                                    className="mt-1 block w-full border border-secondary-dark rounded-md px-3 py-2
                                        placeholder-gray-800 focus:outline-none focus:ring-1  focus:ring-primary
                                        focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                                    autoComplete="tel"
                                    onChange={(e) => setData('phone_1', e.target.value)}
                                    required
                                />
                                <InputError message={errors.phone_1} className="mt-2 text-red-500" />
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
                                        placeholder-gray-800 focus:outline-none focus:ring-1  focus:ring-primary
                                        focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-2 text-red-500" />
                            </div>

                            {/* Confirmação da senha */}
                            <div className="col-span-12">
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirme a Senha"
                                    className="text-primary-dark dark:text-primary-light"
                                />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full border border-secondary-dark rounded-md px-3 py-2
                                        placeholder-gray-800 focus:outline-none focus:ring-1 focus:ring-primary
                                        focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2 text-red-500"
                                />
                            </div>

                            {/* Ações */}
                            <div className="col-span-12 flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
                                <Link
                                    href={route('login')}
                                    className="text-sm text-gray-800 dark:text-secondary-light underline hover:text-primary-dark
                                     dark:hover:text-primary-light"
                                >
                                    Já possui conta?
                                </Link>

                                <PrimaryButton
                                    className="sm:ms-4 w-full sm:w-auto bg-primary DEFAULT hover:bg-primary-dark text-white"
                                    disabled={processing}
                                >
                                    Registrar
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
