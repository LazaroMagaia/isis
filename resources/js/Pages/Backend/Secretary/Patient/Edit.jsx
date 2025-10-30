import { useState, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import Form from '@/Components/Backend/Form.jsx';
import countries from '@/nationalities';
import Swal from 'sweetalert2';

export default function EditUser() {
    const { errors, user } = usePage().props; // user vindo do backend

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

    // Preencher os valores iniciais ao carregar o usuário
    useEffect(() => {
        if (user) {
            setValues({
                email: user.email || '',
                name: user.name || '',
                father_name: user.father_name || '',
                mother_name: user.mother_name || '',
                gender: user.gender || '',
                nationality: user.nationality || '',
                birth_date: user.birth_date
                    ? new Date(user.birth_date).toISOString().slice(0, 10) // YYYY-MM-DD
                    : '',
                phone_1: user.phone_1 || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.put(route('secretary.patient.update', user.id), values, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Usuário atualizado!',
                    text: 'As informações do usuário foram atualizadas com sucesso.',
                    confirmButtonColor: '#8B57A4',
                }).then(() => {
                    router.visit(route('secretary.patient.index'));
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Ocorreu um problema ao atualizar o usuário. Verifique os campos.',
                    confirmButtonColor: '#8B57A4',
                });
            },
        });
    };
    return (
        <DashboardLayout title="Editar Usuário">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={route('secretary.patient.index')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                        Editar Paciente
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
                        <div className="col-span-12 md:col-span-6">
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
                        <div className="col-span-12 md:col-span-6">
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
                        <div className="col-span-12 md:col-span-6  mt-1">
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
                        <div className="col-span-12 md:col-span-6">
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
                        <div className="col-span-12 flex justify-end mt-6">
                            <button
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                            >
                                Atualizar Usuário
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
