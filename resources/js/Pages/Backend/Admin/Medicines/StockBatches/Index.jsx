import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { EditIcon, DeleteIcon } from "@/Components/Backend/HeroIcons";

export default function IndexStockBatches() {
    const { medicine, batches } = usePage().props;
    const formatCurrency = (value) => {
        const number = parseFloat(value) || 0;
        return number.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const columns = [
        { label: 'Número do Lote', key: 'batch_number' },
        { label: 'Quantidade', key: 'quantity' },
        { 
            label: 'Data de Validade', 
            render: (batch) => batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : '-' 
        },
        {
            label: 'Preço por Unidade',
            render: (batch) => {
                const price = parseFloat(batch.cost_price) || 0;
                return `${formatCurrency(price)} MZN`;
            }
        },
       {
            label: 'Total do Lote',
            render: (batch) => {
                const quantity = parseInt(batch.quantity) || 0;
                const price = parseFloat(batch.cost_price) || 0;
                const total = quantity * price;
                return `${formatCurrency(total)} MZN`
            }
        },
        {
            label: 'Ações',
            render: (batch) => (
                <div className="flex gap-2">
                    <Link
                        href={route('admin.medicinebatches.edit', [medicine.id, batch.id])}
                        className="text-blue-500 hover:underline"
                        title="Editar lote"
                    >
                        <EditIcon />
                    </Link>
                    <button
                        onClick={() => handleDelete(batch.id, batch.batch_number)}
                        className="text-red-500 hover:underline"
                        title="Excluir lote"
                    >
                        <DeleteIcon />
                    </button>
                </div>
            )
        }
    ];

    const handleDelete = (id, batchNumber) => {
        Swal.fire({
            title: `Excluir lote ${batchNumber}?`,
            text: "Esta ação não pode ser desfeita.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.medicinebatches.destroy', [id]), {
                    preserveState: true,
                    onSuccess: () => {
                        Swal.fire('Excluído!', `Lote ${batchNumber} removido com sucesso.`, 'success');
                    },
                    onError: () => {
                        Swal.fire('Erro!', 'Não foi possível excluir. Tente novamente.', 'error');
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout title={`Lotes do Medicamento: ${medicine.name}`}>
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 w-full">
                    <Link
                        href={route('admin.medicines.index')}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        &larr; Voltar aos Medicamentos
                    </Link>
                    <Link
                        href={route('admin.medicinebatches.create', { id: medicine.id })}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition w-full sm:w-auto text-center"
                    >
                        Adicionar Lote
                    </Link>

                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <PaginatedTable
                        columns={columns}
                        data={batches}
                        links={[]} // se quiser paginação, ajustar no backend
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
