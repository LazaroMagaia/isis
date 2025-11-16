import { usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { useState } from 'react';
import Swal from 'sweetalert2';
import Form from '@/Components/Backend/Form.jsx';

export default function CreateStockBatch() {
    const { medicine,errors } = usePage().props;

    const [formData, setFormData] = useState({
        batch_number: '',
        quantity: '',
        expiry_date: '',
        cost_price: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route('admin.medicinebatches.store', medicine.id), formData, {
            preserveState: true,
            onSuccess: () => {
                Swal.fire('Sucesso!', 'Lote criado com sucesso.', 'success');
                setFormData({
                    batch_number: '',
                    quantity: '',
                    expiry_date: '',
                    cost_price: '',
                });
            },
            onError: (errors) => {
                Swal.fire('Erro', 'Verifique os campos e tente novamente.', 'error');
            }
        });
    };

    return (
        <DashboardLayout title={`Adicionar Lote: ${medicine.name}`}>
            <div className="max-w-7xl mx-auto px-4 py-10">
                <button
                    onClick={() => router.get(route('admin.medicinebatches.index', medicine.id))}
                    className="text-gray-600 dark:text-gray-300 hover:underline mb-6"
                >
                    &larr; Voltar aos lotes
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
                        {/* Número do lote */}
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="text"
                                label="Número do Lote"
                                name="batch_number"
                                value={formData.batch_number}
                                onChange={e => setFormData({ ...formData, batch_number: e.target.value })}
                                required
                            />
                            {errors?.batch_number && (
                                <p className="text-sm text-red-500 mt-1">{errors.batch_number}</p>
                            )}
                            <p className="text-sm text-gray-500">Identificação única do lote.</p>
                        </div>

                        {/* Quantidade */}
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="number"
                                label="Quantidade"
                                name="quantity"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                required
                                min={1}
                            />
                            {errors?.quantity && (
                                <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
                            )}
                            <p className="text-sm text-gray-500">Quantidade inicial disponível neste lote.</p>
                        </div>

                        {/* Data de validade */}
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="date"
                                label="Data de Validade"
                                name="expiry_date"
                                value={formData.expiry_date}
                                onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                required
                            />
                            {errors?.expiry_date && (
                                <p className="text-sm text-red-500 mt-1">{errors.expiry_date}</p>
                            )}
                            <p className="text-sm text-gray-500">Data de validade do lote.</p>
                        </div>

                        {/* Preço de custo */}
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="number"
                                label="Preço por unidade"
                                name="cost_price"
                                value={formData.cost_price}
                                onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                                required
                                min={0}
                                step={0.01}
                            />
                            {errors?.cost_price && (
                                <p className="text-sm text-red-500 mt-1">{errors.cost_price}</p>
                            )}
                            <p className="text-sm text-gray-500">Preço de aquisição por unidade deste lote.</p>
                        </div>
                        <div className="col-span-12 flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => router.get(route('admin.medicinebatches.index', medicine.id))}
                                className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
                            >
                                Salvar Lote
                            </button>
                        </div>  
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
