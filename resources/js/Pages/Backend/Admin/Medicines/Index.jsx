import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { EditIcon, DeleteIcon, PlusIcon, ArchiveIcon } from "@/Components/Backend/HeroIcons";
import Form from '@/Components/Backend/Form.jsx';

export default function IndexMedicines() {
    const { medicines, filters, categories } = usePage().props;

    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    const columns = [
        { label: 'Nome', key: 'name' },
        { 
            label: 'Categoria', 
            render: (medicine) => medicine.category ? medicine.category.name : '-' 
        },
        { label: 'Forma', key: 'form' },
        { label: 'Dosagem', key: 'dosage' },
        { 
            label: 'Stock Total', 
            render: (medicine) => medicine.batches_count ?? 0 
        },
        {
            label: 'Ações',
            render: (medicine) => (
                <div className="flex gap-2">
                    <Link
                        href={route('admin.medicines.edit', medicine.id)}
                        className="text-blue-500 hover:underline"
                        title="Editar medicamento"
                    >
                        <EditIcon/>
                    </Link>
                    <Link
                        href={route('admin.medicinebatches.index', medicine.id)}
                        className="text-green-500 hover:underline"
                        title="Gerir stock/lotes"
                    >
                        <ArchiveIcon/>
                    </Link>
                    <button
                        onClick={() => handleDelete(medicine.id, medicine.name)}
                        className="text-red-500 hover:underline"
                        title="Excluir medicamento"
                    >
                        <DeleteIcon/>
                    </button>
                </div>
            )
        }
    ];

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.medicines.index'), { search, category_id: categoryId }, { preserveState: true, replace: true });
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: `Excluir ${name}?`,
            text: "Esta ação não pode ser desfeita.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.medicines.destroy', id), {
                    preserveState: true,
                    onSuccess: () => {
                        Swal.fire('Excluído!', `${name} foi removido com sucesso.`, 'success');
                    },
                    onError: () => {
                        Swal.fire('Erro!', 'Não foi possível excluir. Tente novamente.', 'error');
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout title="Medicamentos">
            <div className="max-w-7xl mx-auto px-4 py-10">

                {/* Cabeçalho com botões */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 w-full p-3 md:p-0">
                    <Link
                        href={route('admin.dashboard')}
                        className="text-gray-600 dark:text-gray-300 hover:underline w-full sm:w-auto text-left sm:text-left"
                    >
                        &larr; Voltar
                    </Link>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link
                            href={route('admin.medicinecategories.index')}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition w-full sm:w-auto text-center"
                        >
                            Gerir Categorias
                        </Link>
                        <Link
                            href={route('admin.medicines.create')}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition w-full sm:w-auto text-center"
                        >
                            Adicionar Medicamento
                        </Link>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
                    <form onSubmit={handleFilter} className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6">
                            <Form
                                type="text"
                                placeholder="Pesquisar por nome"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                className="mt-1 block w-full h-10 px-3 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 
                                dark:text-white focus:ring-2 focus:ring-primary focus:border-0"
                            >
                                <option value="">Todas Categorias</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-12 sm:col-span-3 flex justify-start mt-1">
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 h-10 rounded hover:bg-primary-dark transition w-full"
                            >
                                Filtrar
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabela */}
                <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
                    <PaginatedTable
                        columns={columns}
                        data={medicines.data}
                        links={medicines.links}
                    />
                </div>
               
            </div>
        </DashboardLayout>
    );
}
