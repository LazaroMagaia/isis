import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-light dark:bg-gray-900 px-4 py-12">
            <Head title="Esqueceu a Senha" />

            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Redefinir Senha
                </h2>

                <p className="mb-6 text-gray-700 dark:text-gray-300 text-sm">
                    Esqueceu sua senha? Sem problemas. Informe seu e-mail abaixo e enviaremos um link para redefinir sua senha.
                </p>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="grid grid-cols-12 gap-4">
                    {/* Email */}
                    <div className="col-span-12">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full border border-secondary-dark rounded-md px-3 py-2
                                placeholder-gray-800 focus:outline-none focus:ring-1 focus:ring-primary
                                focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                            isFocused={true}
                            placeholder="Digite seu e-mail"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2 text-red-500" />
                    </div>

                    {/* Botão */}
                    <div className="col-span-12 flex justify-end mt-4">
                        <PrimaryButton
                            className="w-full sm:w-auto bg-primary DEFAULT hover:bg-primary-dark text-white"
                            disabled={processing}
                        >
                            Enviar Link de Redefinição
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
