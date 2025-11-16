import { usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Form from '@/Components/Backend/Form.jsx';

export default function EditStockBatch() {
    const { medicine, batch } = usePage().props;

    const [formData, setFormData] = useState({
        batch_number: '',
        quantity: '',
        expiry_date: '',
        cost_price: '',
    });
    useEffect(() => {
        if (batch) {
            setFormData({
                batch_number: batch.batch_number || '',
                quantity: batch.quantity || '',
                expiry_date: batch.expiry_date
                    ? new Date(batch.expiry_date).toISOString().substring(0, 10)
                    : '',
                cost_price: batch.cost_price || '',
            });
        }
    }, [batch]);


    const handleSubmit = (e) => {
        e.preventDefault();

        router.put(route('admin.medicinebatches.update', [batch.id]), formData, {
            preserveState: true,
            onSuccess: () => {
                Swal.fire('Sucesso!', 'Lote atualizado com sucesso.', 'success');
            },
            onError: () => {
                Swal.fire('Erro', 'Verifique os campos e tente novamente.', 'error');
            }
        });
    };

    // função para exibir preço formatado visualmente
    const formatPrice = (price) => {
        if (!price) return '';
        return 'MZN ' + parseFloat(price)
            .toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <DashboardLayout title={`Editar Lote: ${medicine.name}`}>
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
                            <p className="text-sm text-gray-500">Identificação do lote do medicamento.</p>
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
                            <p className="text-sm text-gray-500">Quantidade total de unidades neste lote.</p>
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

                            <p className="text-sm text-gray-500">Data de expiração do lote.</p>
                        </div>

                        {/* Preço de custo */}
                        <div className="col-span-12 md:col-span-6">
                            <Form
                                type="number"
                                label="Preço de Custo"
                                name="cost_price"
                                value={formData.cost_price}
                                onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                                required
                                min={0}
                                step={0.01}
                            />
                            <p className="text-sm text-gray-500">
                                Preço unitário de aquisição do lote ({formatPrice(formData.cost_price)}).
                            </p>
                        </div>

                        {/* Botões */}
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
                                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition"
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
