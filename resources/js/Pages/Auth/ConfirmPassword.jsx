import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-light dark:bg-gray-900 px-4 py-12">
            <Head title="Confirmar Senha" />

            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Confirme sua senha
                </h2>

                <p className="mb-6 text-gray-700 dark:text-gray-300 text-sm">
                    Esta é uma área segura do aplicativo. Por favor, confirme sua senha antes de continuar.
                </p>

                <form onSubmit={submit} className="grid grid-cols-12 gap-4">
                    {/* Senha */}
                    <div className="col-span-12">
                        <InputLabel
                            htmlFor="password"
                            value="Senha"
                            className="text-gray-900 dark:text-white"
                        />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full border border-secondary-dark rounded-md px-3 py-2
                                placeholder-gray-800 focus:outline-none focus:ring-1 focus:ring-primary
                                focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Digite sua senha"
                        />
                        <InputError message={errors.password} className="mt-2 text-red-500" />
                    </div>

                    {/* Botão */}
                    <div className="col-span-12 flex justify-end mt-4">
                        <PrimaryButton
                            className="w-full sm:w-auto bg-primary DEFAULT hover:bg-primary-dark text-white"
                            disabled={processing}
                        >
                            Confirmar
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
