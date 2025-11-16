import { usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Form from '@/Components/Backend/Form.jsx';

export default function EditMedicine() {
    const { medicine, categories, errors } = usePage().props;

    const [formData, setFormData] = useState({
        name: '',
        form: '',
        dosage: '',
        unit: '',
        category_id: '',
    });

    // Preencher os dados quando o componente carregar
    useEffect(() => {
        if (medicine) {
            setFormData({
                name: medicine.name || '',
                form: medicine.form || '',
                dosage: medicine.dosage || '',
                unit: medicine.unit || '',
                category_id: medicine.category_id || '',
            });
        }
    }, [medicine]);

    const handleSubmit = (e) => {
        e.preventDefault();

        router.put(route('admin.medicines.update', medicine.id), formData, {
            preserveState: true,
            onSuccess: () => {
                Swal.fire('Sucesso!', 'Medicamento atualizado com sucesso.', 'success');
            },
            onError: () => {
                Swal.fire('Erro', 'Verifique os campos e tente novamente.', 'error');
            },
        });
    };

    return (
        <DashboardLayout title="Editar Medicamento">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <button
                    onClick={() => router.get(route('admin.medicines.index'))}
                    className="text-gray-600 dark:text-gray-300 hover:underline mb-6"
                >
                    &larr; Voltar
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">

                        {/* Nome */}
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="text"
                                label="Nome"
                                name="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                            <p className="text-sm text-gray-500">Nome comercial ou científico do medicamento.</p>
                        </div>

                        {/* Forma */}
                        <div className="col-span-12 md:col-span-6 mt-1">
                            <Form
                                type="select"
                                label="Forma"
                                name="form"
                                value={formData.form}
                                onChange={e => setFormData({ ...formData, form: e.target.value })}
                                options={[
                                    { label: 'Comprimido', value: 'Comprimido' },
                                    { label: 'Cápsula', value: 'Cápsula' },
                                    { label: 'Xarope', value: 'Xarope' },
                                    { label: 'Pomada', value: 'Pomada' },
                                    { label: 'Injetável', value: 'Injetável' },
                                    { label: 'Supositório', value: 'Supositório' },
                                    { label: 'Spray', value: 'Spray' },
                                    { label: 'Gotas', value: 'Gotas' },
                                ]}
                                required
                            />
                            {errors.form && <p className="text-sm text-red-500 mt-1">{errors.form}</p>}
                            <p className="text-sm text-gray-500">Selecione a forma farmacêutica do medicamento.</p>
                        </div>

                        {/* Dosagem */}
                        <div className="col-span-12 md:col-span-4">
                            <Form
                                type="text"
                                label="Dosagem"
                                name="dosage"
                                value={formData.dosage}
                                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                required
                            />
                            {errors.dosage && <p className="text-sm text-red-500 mt-1">{errors.dosage}</p>}
                            <p className="text-sm text-gray-500">Quantidade de princípio ativo por unidade.</p>
                        </div>

                        {/* Unidade */}
                        <div className="col-span-12 md:col-span-4 mt-1">
                            <Form
                                type="select"
                                label="Unidade"
                                name="unit"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                options={[
                                    { label: 'Comprimido', value: 'Comprimido' },
                                    { label: 'Frasco', value: 'Frasco' },
                                    { label: 'Ampola', value: 'Ampola' },
                                    { label: 'Cápsula', value: 'Cápsula' },
                                    { label: 'Sache', value: 'Sache' },
                                    { label: 'Pote', value: 'Pote' },
                                ]}
                                required
                            />
                            {errors.unit && <p className="text-sm text-red-500 mt-1">{errors.unit}</p>}
                            <p className="text-sm text-gray-500">Unidade de armazenamento ou administração.</p>
                        </div>

                        {/* Categoria */}
                        <div className="col-span-12 md:col-span-4 mt-1">
                            <Form
                                type="select"
                                label="Categoria"
                                name="category_id"
                                value={formData.category_id}
                                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                                required
                            />
                            {errors.category_id && <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>}
                            <p className="text-sm text-gray-500">Selecione a categoria do medicamento.</p>
                        </div>

                        {/* Botões */}
                        <div className="col-span-12 flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => router.get(route('admin.medicines.index'))}
                                className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
