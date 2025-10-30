import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import Form from '@/Components/Backend/Form.jsx';
import Swal from 'sweetalert2';

export default function CreateService() {
    const { errors, categories } = usePage().props;

    const [values, setValues] = useState({
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
        requires_approval: false,
        is_active: true,
        category_id: '',
    });

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setValues({
            ...values,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route('admin.services.store'), values, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Serviço criado!',
                    text: 'O serviço foi cadastrado com sucesso.',
                    confirmButtonColor: '#8B57A4',
                }).then(() => {
                    router.visit(route('admin.services.index'));
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Ocorreu um problema ao criar o serviço. Verifique os campos.',
                    confirmButtonColor: '#8B57A4',
                });
            },
        });
    };

    return (
        <DashboardLayout title="Criar Serviço">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={route('admin.services.index')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                        Novo Serviço
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-12 gap-6"
                    >
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="text"
                                label="Nome do Serviço"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                error={errors.name}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="select"
                                label="Categoria"
                                name="category_id"
                                value={values.category_id}
                                onChange={handleChange}
                                options={categories.map((cat) => ({
                                    value: cat.id,
                                    label: cat.name,
                                }))}
                                error={errors.category_id}
                                required
                            />
                        </div>

                        <div className="col-span-12">
                            <Form
                                type="textarea"
                                label="Descrição"
                                name="description"
                                value={values.description}
                                onChange={handleChange}
                                error={errors.description}
                                required={false}
                            />
                        </div>

                        <div className="col-span-12 md:col-span-5">
                            <Form
                                type="number"
                                step="0.01"
                                label="Preço (MZN)"
                                name="price"
                                value={values.price}
                                onChange={handleChange}
                                error={errors.price}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-5">
                            <Form
                                type="number"
                                label="Duração (minutos)"
                                name="duration_minutes"
                                value={values.duration_minutes}
                                onChange={handleChange}
                                error={errors.duration_minutes}
                                required
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="checkbox"
                                label="Requer aprovação/pagamento prévio"
                                name="requires_approval"
                                checked={values.requires_approval}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="checkbox"
                                label="Serviço ativo"
                                name="is_active"
                                checked={values.is_active}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-span-12 flex justify-end mt-6">
                            <button
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition"
                            >
                                Criar Serviço
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
