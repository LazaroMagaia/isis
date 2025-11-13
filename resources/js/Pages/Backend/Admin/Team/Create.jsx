import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import Form from '@/Components/Backend/Form.jsx';
import countries from '@/nationalities';
import Swal from 'sweetalert2';

export default function CreateUser() {
    const { errors } = usePage().props;

    const [values, setValues] = useState({
        email: '',
        role: 'doctor',
        name: '',
        father_name: '',
        mother_name: '',
        gender: '',
        nationality: '',
        birth_date: '',
        phone_1: '',
    });

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route('admin.team.store'), values, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Membro criado!',
                    text: 'O Membro foi cadastrado com sucesso.',
                    confirmButtonColor: '#8B57A4', // cor primary
                }).then(() => {
                    // Redireciona para a listagem após fechar o alerta
                    router.visit(route('admin.team.index'));
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Ocorreu um problema ao criar o Membro. Verifique os campos.',
                    confirmButtonColor: '#8B57A4',
                });
            },
        });
    };

    return (
        <DashboardLayout title="Novo Membro">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={route('admin.team.index')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                        Novo Membro
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-12 gap-6"
                    >
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="text"
                                label="Nome"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                error={errors.name}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="email"
                                label="Email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                error={errors.email}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="text"
                                label="Telefone"
                                name="phone_1"
                                value={values.phone_1}
                                onChange={handleChange}
                                error={errors.phone_1}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="select"
                                label="Função (Role)"
                                name="role"
                                value={values.role}
                                onChange={handleChange}
                                options={[
                                    { value: 'admin', label: 'Administrador' },
                                    { value: 'doctor', label: 'Médico' },
                                    { value: 'nurse', label: 'Enfermeiro' },
                                    { value: 'secretary', label: 'Secretário' },
                                ]}
                                error={errors.role}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="date"
                                label="Data de Nascimento"
                                name="birth_date"
                                value={values.birth_date}
                                onChange={handleChange}
                                error={errors.birth_date}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="text"
                                label="Nome do Pai"
                                name="father_name"
                                value={values.father_name}
                                onChange={handleChange}
                                error={errors.father_name}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="text"
                                label="Nome da Mãe"
                                name="mother_name"
                                value={values.mother_name}
                                onChange={handleChange}
                                error={errors.mother_name}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="select"
                                label="Gênero"
                                name="gender"
                                value={values.gender}
                                onChange={handleChange}
                                options={[
                                    { value: 'male', label: 'Masculino' },
                                    { value: 'female', label: 'Feminino' },
                                ]}
                                error={errors.gender}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-8">
                            <Form
                                type="select"
                                label="Nacionalidade"
                                name="nationality"
                                value={values.nationality}
                                onChange={handleChange}
                                options={countries}
                                error={errors.nationality}
                                required
                                searchable
                            />
                        </div>

                        <div className="col-span-12 flex justify-end mt-6">
                            <button
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                            >
                                Criar Usuário
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </DashboardLayout>
    );
}
