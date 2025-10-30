import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-light dark:bg-gray-900 px-4 py-12">
            <Head title="Redefinir Senha" />

            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Redefinir Senha
                </h2>

                <form onSubmit={submit} className="grid grid-cols-12 gap-4">
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
                                placeholder-secondary-light focus:outline-none focus:ring-2 focus:ring-primary
                                focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2 text-red-500" />
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
                                focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
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
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full border border-secondary-dark rounded-md px-3 py-2
                                placeholder-gray-800 focus:outline-none focus:ring-1 focus:ring-primary
                                focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2 text-red-500" />
                    </div>

                    {/* Botão */}
                    <div className="col-span-12 flex justify-end mt-4">
                        <PrimaryButton
                            className="w-full sm:w-auto bg-primary DEFAULT hover:bg-primary-dark text-white"
                            disabled={processing}
                        >
                            Redefinir Senha
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
