import { usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/AuthenticatedLayout.jsx';
import PaginatedTable from '@/Components/Backend/PaginatedTable.jsx';
import { useState } from 'react';
import Swal from 'sweetalert2';
import Form from '@/Components/Backend/Form.jsx';
import { EditIcon, DeleteIcon } from "@/Components/Backend/HeroIcons";

export default function IndexServiceCategories() {
    const { categories, filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' ou 'edit'
    const [formData, setFormData] = useState({ name: '', description: '', id: null });

    // Filtrar
    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.servicecategories.index'), { search }, { preserveState: true, replace: true });
    };

    // Excluir
    const handleDelete = (id, name) => {
        Swal.fire({
            title: `Excluir categoria ${name}?`,
            text: "Esta ação não pode ser desfeita.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.services.category.destroy', id), {
                    preserveState: true,
                    onSuccess: () => Swal.fire('Excluído!', `Categoria ${name} foi excluída.`, 'success'),
                    onError: () => Swal.fire('Erro', 'Não foi possível excluir a categoria.', 'error')
                });
            }
        });
    };

    // Abrir modal
    const openModal = (mode, category = null) => {
        setModalMode(mode);
        if (category) {
            setFormData({ name: category.name, description: category.description, id: category.id });
        } else {
            setFormData({ name: '', description: '', id: null });
        }
        setModalOpen(true);
    };

    // Submit modal
    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'create') {
            router.post(route('admin.services.category.store'), formData, {
                preserveState: true,
                onSuccess: () => { setModalOpen(false); Swal.fire('Sucesso!', 'Categoria criada com sucesso.', 'success'); },
                onError: () => Swal.fire('Erro', 'Não foi possível criar a categoria.', 'error')
            });
        } else {
            router.put(route('admin.services.category.update', formData.id), formData, {
                preserveState: true,
                onSuccess: () => { setModalOpen(false); Swal.fire('Sucesso!', 'Categoria atualizada com sucesso.', 'success'); },
                onError: () => Swal.fire('Erro', 'Não foi possível atualizar a categoria.', 'error')
            });
        }
    };

    return (
        <DashboardLayout title="Categorias de Serviços">
            <div className="max-w-7xl mx-auto px-4 py-10">

                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 w-full">
                    <button
                        onClick={() => router.get(route('admin.services.index'))}
                        className="text-gray-600 dark:text-gray-300 hover:underline w-full sm:w-auto text-left"
                    >
                        &larr; Voltar
                    </button>
                    <button
                        onClick={() => openModal('create')}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition w-full sm:w-auto text-center"
                    >
                        Adicionar Categoria
                    </button>
                </div>

                {/* Filtro */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 w-full">
                        <Form
                            type="text"
                            placeholder="Pesquisar por nome"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="sm:w-1/3"
                        />
                        <button
                            type="submit"
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition w-full sm:w-auto"
                        >
                            Filtrar
                        </button>
                    </form>
                </div>

                {/* Tabela */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <PaginatedTable
                        columns={[
                            { label: 'Nome', key: 'name' },
                            { label: 'Descrição', key: 'description' },
                            {
                                label: 'Ações',
                                key: 'actions',
                                render: (category) => (
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => openModal('edit', category)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            <EditIcon/>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id, category.name)}
                                            className="text-red-500 hover:underline"
                                        >
                                            <DeleteIcon/>
                                        </button>
                                    </div>
                                )
                            },
                        ]}
                        data={categories.data}
                        links={categories.links}
                    />
                </div>

                {/* Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-xl">
                            <h2 className="text-xl font-semibold mb-4">
                                {modalMode === 'create' ? 'Adicionar Categoria' : 'Editar Categoria'}
                            </h2>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <Form
                                    type="text"
                                    label="Nome"
                                    name="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full min-w-[250px]"
                                />
                                <Form
                                    type="textarea"
                                    label="Descrição"
                                    name="description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="h-24 w-full min-w-[250px]"
                                />
                                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700 w-full sm:w-auto"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition w-full sm:w-auto"
                                    >
                                        {modalMode === 'create' ? 'Criar' : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
